// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { hooks } from "@feathersjs/hooks/lib";
import {
  AzureAccountProvider,
  AzureSolutionSettings,
  err,
  FxError,
  ok,
  Result,
  v2,
  v3,
  Void,
} from "@microsoft/teamsfx-api";
import fs from "fs-extra";
import * as path from "path";
import { Service } from "typedi";
import { ArmTemplateResult } from "../../../../common/armInterface";
import { Bicep } from "../../../../common/constants";
import {
  generateBicepFromFile,
  getResourceGroupNameFromResourceId,
  getSiteNameFromResourceId,
  getSubscriptionIdFromResourceId,
} from "../../../../common/tools";
import { CommonErrorHandlerMW } from "../../../../core/middleware/CommonErrorHandlerMW";
import { getTemplatesFolder } from "../../../../folder";
import { TabOptionItem } from "../../../solution/fx-solution/question";
import { BuiltInFeaturePluginNames } from "../../../solution/fx-solution/v3/constants";
import {
  DotnetConfigInfo as ConfigInfo,
  DotnetPathInfo as PathInfo,
  DotnetPluginInfo as PluginInfo,
  WebappBicep,
  WebappBicepFile,
} from "../dotnet/constants";
import { DotnetConfigKey as ConfigKey } from "../dotnet/enum";
import * as Deploy from "../dotnet/ops/deploy";
import { DotnetPluginConfig } from "../dotnet/plugin";
import { runWithErrorCatchAndThrow } from "../dotnet/resources/errors";
import { AzureClientFactory } from "../dotnet/utils/azure-client";
import { Messages } from "../resources/messages";
import { DeployProgress } from "../resources/steps";
import { FetchConfigError, ProjectPathError } from "./error";

@Service(BuiltInFeaturePluginNames.dotnet)
export class DotnetPluginV3 implements v3.FeaturePlugin {
  name = BuiltInFeaturePluginNames.dotnet;
  displayName = "ASP.NET";
  @hooks([CommonErrorHandlerMW({ telemetry: { component: BuiltInFeaturePluginNames.frontend } })])
  async scaffold(
    ctx: v3.ContextWithManifestProvider,
    inputs: v2.InputsWithProjectPath
  ): Promise<Result<Void | undefined, FxError>> {
    const solutionSettings = ctx.projectSetting.solutionSettings as
      | AzureSolutionSettings
      | undefined;
    return ok(undefined);
  }
  @hooks([
    CommonErrorHandlerMW({
      telemetry: {
        component: BuiltInFeaturePluginNames.dotnet,
      },
    }),
  ])
  async generateResourceTemplate(
    ctx: v3.ContextWithManifestProvider,
    inputs: v2.InputsWithProjectPath
  ): Promise<Result<v2.ResourceTemplate, FxError>> {
    ctx.logProvider.info(Messages.StartGenerateArmTemplates(this.name));
    const solutionSettings = ctx.projectSetting.solutionSettings as
      | AzureSolutionSettings
      | undefined;
    const pluginCtx = { plugins: solutionSettings ? solutionSettings.activeResourcePlugins : [] };

    const bicepTemplateDirectory = PathInfo.bicepTemplateFolder(getTemplatesFolder());

    const provisionTemplateFilePath = path.join(bicepTemplateDirectory, Bicep.ProvisionFileName);
    const provisionWebappTemplateFilePath = path.join(
      bicepTemplateDirectory,
      WebappBicepFile.provisionTemplateFileName
    );

    const configTemplateFilePath = path.join(bicepTemplateDirectory, Bicep.ConfigFileName);
    const configWebappTemplateFilePath = path.join(
      bicepTemplateDirectory,
      WebappBicepFile.configurationTemplateFileName
    );

    const provisionOrchestration = await generateBicepFromFile(
      provisionTemplateFilePath,
      pluginCtx
    );
    const provisionModule = await generateBicepFromFile(provisionWebappTemplateFilePath, pluginCtx);
    const configOrchestration = await generateBicepFromFile(configTemplateFilePath, pluginCtx);
    const configModule = await generateBicepFromFile(configWebappTemplateFilePath, pluginCtx);
    const result: ArmTemplateResult = {
      Provision: {
        Orchestration: provisionOrchestration,
        Modules: { webapp: provisionModule },
      },
      Configuration: {
        Orchestration: configOrchestration,
        Modules: { webapp: configModule },
      },
      Reference: WebappBicep.Reference,
    };
    ctx.logProvider.info(Messages.EndGenerateArmTemplates(this.name));
    return ok({ kind: "bicep", template: result });
  }
  @hooks([CommonErrorHandlerMW({ telemetry: { component: BuiltInFeaturePluginNames.dotnet } })])
  async addFeature(
    ctx: v3.ContextWithManifestProvider,
    inputs: v2.InputsWithProjectPath
  ): Promise<Result<v2.ResourceTemplate | undefined, FxError>> {
    const scaffoldRes = await this.scaffold(ctx, inputs);
    if (scaffoldRes.isErr()) return err(scaffoldRes.error);
    const armRes = await this.generateResourceTemplate(ctx, inputs);
    if (armRes.isErr()) return err(armRes.error);
    const solutionSettings = ctx.projectSetting.solutionSettings as AzureSolutionSettings;
    //TODO what capabilities?
    const capabilities = solutionSettings.capabilities;
    const activeResourcePlugins = solutionSettings.activeResourcePlugins;
    // if (!capabilities.includes(TabOptionItem.id)) capabilities.push(TabOptionItem.id);
    if (!activeResourcePlugins.includes(this.name)) activeResourcePlugins.push(this.name);
    return ok(armRes.value);
  }
  @hooks([CommonErrorHandlerMW({ telemetry: { component: BuiltInFeaturePluginNames.dotnet } })])
  async afterOtherFeaturesAdded(
    ctx: v3.ContextWithManifestProvider,
    inputs: v3.OtherFeaturesAddedInputs
  ): Promise<Result<v2.ResourceTemplate | undefined, FxError>> {
    ctx.logProvider.info(Messages.StartUpdateArmTemplates(this.name));
    const solutionSettings = ctx.projectSetting.solutionSettings as
      | AzureSolutionSettings
      | undefined;
    const pluginCtx = { plugins: solutionSettings ? solutionSettings.activeResourcePlugins : [] };
    const bicepTemplateDirectory = PathInfo.bicepTemplateFolder(getTemplatesFolder());
    const configWebappTemplateFilePath = path.join(
      bicepTemplateDirectory,
      WebappBicepFile.configurationTemplateFileName
    );
    const configModule = await generateBicepFromFile(configWebappTemplateFilePath, pluginCtx);
    const result: ArmTemplateResult = {
      Reference: WebappBicep.Reference,
      Configuration: {
        Modules: { webapp: configModule },
      },
    };
    ctx.logProvider.info(Messages.EndUpdateTemplates(this.name));
    return ok({ kind: "bicep", template: result });
  }
  private syncConfigFromContext(ctx: v2.Context, envInfo: v3.EnvInfoV3): DotnetPluginConfig {
    const config: DotnetPluginConfig = {};
    const solutionConfig = envInfo.state.solution as v3.AzureSolutionConfig;
    config.resourceGroupName = solutionConfig.resourceGroupName;
    config.subscriptionId = solutionConfig.subscriptionId;

    const dotnetConfig = envInfo.state[this.name];

    config.webAppName = dotnetConfig[ConfigInfo.webAppName] as string;
    config.appServicePlanName = dotnetConfig[ConfigInfo.appServicePlanName] as string;
    config.projectFilePath = ctx.projectSetting.pluginSettings?.projectFilePath as string;

    // Resource id priors to other configs
    const webAppResourceId = dotnetConfig[ConfigKey.webAppResourceId] as string;
    if (webAppResourceId) {
      config.webAppResourceId = webAppResourceId;
      config.resourceGroupName = getResourceGroupNameFromResourceId(webAppResourceId);
      config.webAppName = getSiteNameFromResourceId(webAppResourceId);
      config.subscriptionId = getSubscriptionIdFromResourceId(webAppResourceId);
    }
    return config;
  }
  private checkAndGet<T>(v: T | undefined, key: string) {
    if (v) {
      return v;
    }
    throw new FetchConfigError(key);
  }
  @hooks([CommonErrorHandlerMW({ telemetry: { component: BuiltInFeaturePluginNames.dotnet } })])
  async deploy(
    ctx: v2.Context,
    inputs: v2.InputsWithProjectPath,
    envInfo: v2.DeepReadonly<v3.EnvInfoV3>,
    tokenProvider: AzureAccountProvider
  ): Promise<Result<Void, FxError>> {
    ctx.logProvider.info(Messages.StartDeploy(this.name));
    const progress = ctx.userInteraction.createProgressBar(
      Messages.DeployProgressTitle,
      Object.entries(DeployProgress.steps).length
    );
    await progress.start(Messages.ProgressStart);

    const config = this.syncConfigFromContext(ctx, envInfo as v3.EnvInfoV3);

    const webAppName = this.checkAndGet(config.webAppName, ConfigKey.webAppName);
    const resourceGroupName = this.checkAndGet(
      config.resourceGroupName,
      ConfigKey.resourceGroupName
    );
    const subscriptionId = this.checkAndGet(config.subscriptionId, ConfigKey.subscriptionId);
    const credential = this.checkAndGet(
      await tokenProvider.getAccountCredentialAsync(),
      ConfigKey.credential
    );

    const projectFilePath = path.resolve(
      inputs.projectPath,
      this.checkAndGet(config.projectFilePath, ConfigKey.projectFilePath)
    );

    await runWithErrorCatchAndThrow(
      new ProjectPathError(projectFilePath),
      async () => await fs.pathExists(projectFilePath)
    );
    const projectPath = path.dirname(projectFilePath);

    const framework = await Deploy.getFrameworkVersion(projectFilePath);
    const runtime = PluginInfo.defaultRuntime;

    const client = AzureClientFactory.getWebSiteManagementClient(credential, subscriptionId);

    await Deploy.build(projectPath, runtime);

    const folderToBeZipped = PathInfo.publishFolderPath(projectPath, framework, runtime);
    await Deploy.zipDeploy(client, resourceGroupName, webAppName, folderToBeZipped);

    await progress.end(true);
    ctx.logProvider.info(Messages.EndDeploy(this.name));

    return ok(Void);
  }
}
