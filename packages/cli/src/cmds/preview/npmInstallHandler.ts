// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

"use strict";

import { LogLevel } from "@microsoft/teamsfx-api";
import {
  ITaskDefinition,
  LocalEnvManager,
  ProjectSettingsHelper,
  TaskDefinition,
} from "@microsoft/teamsfx-core";
import { spawn } from "child_process";
import cliLogger from "../../commonlib/log";
import cliTelemetry, { CliTelemetry } from "../../telemetry/cliTelemetry";
import {
  TelemetryEvent,
  TelemetryProperty,
  TelemetrySuccess,
} from "../../telemetry/cliTelemetryEvents";
import { CliConfigAutomaticNpmInstall, CliConfigOptions, UserSettings } from "../../userSetttings";
import * as constants from "./constants";
import { NpmInstallFailed } from "./errors";

export async function automaticNpmInstallHandler(
  workspaceFolder: string,
  excludeFrontend: boolean,
  excludeBackend: boolean,
  excludeBot: boolean
): Promise<void> {
  try {
    if (getAutomaticNpmInstallSetting()) {
      const localEnvManager = new LocalEnvManager(cliLogger, CliTelemetry.getReporter());
      const projectSettings = await localEnvManager.getProjectSettings(workspaceFolder);
      const tasks: Map<string, Promise<number | null>> = new Map<string, Promise<number | null>>();
      if (ProjectSettingsHelper.isSpfx(projectSettings)) {
        tasks.set("spfx", runTask(TaskDefinition.spfxInstall(workspaceFolder)));
      } else {
        if (!excludeFrontend && ProjectSettingsHelper.includeFrontend(projectSettings)) {
          tasks.set("frontend", runTask(TaskDefinition.frontendInstall(workspaceFolder)));
        }
        if (!excludeBackend && ProjectSettingsHelper.includeBackend(projectSettings)) {
          tasks.set("backend", runTask(TaskDefinition.backendInstall(workspaceFolder)));
        }
        if (!excludeBot && ProjectSettingsHelper.includeBot(projectSettings)) {
          tasks.set("bot", runTask(TaskDefinition.botInstall(workspaceFolder)));
        }
      }

      if (tasks.size > 0) {
        cliLogger.necessaryLog(LogLevel.Info, constants.automaticNpmInstallHintMessage);
        try {
          const properties: { [key: string]: string } = {};
          for (const key of tasks.keys()) {
            properties[key] = "true";
          }
          cliTelemetry.sendTelemetryEvent(TelemetryEvent.AutomaticNpmInstallStart, properties);
        } catch {
          // ignore telemetry error
        }

        const properties: { [key: string]: string } = {};
        let failed = false;
        const keys = tasks.keys();
        for (const task of tasks.values()) {
          const code = await task;
          if (code !== 0) {
            failed = true;
          }
          properties[keys.next().value] = code + "";
        }
        if (failed) {
          cliTelemetry.sendTelemetryErrorEvent(
            TelemetryEvent.AutomaticNpmInstall,
            NpmInstallFailed(),
            properties
          );
        } else {
          properties[TelemetryProperty.Success] = TelemetrySuccess.Yes;
          cliTelemetry.sendTelemetryEvent(TelemetryEvent.AutomaticNpmInstall, properties);
        }
      }
    }
  } catch (error) {
    cliLogger.warning(`Automatic npm install failed: ${error}`);
  }
}

export function getAutomaticNpmInstallSetting(): boolean {
  try {
    const result = UserSettings.getConfigSync();
    if (result.isErr()) {
      throw result.error;
    }

    const config = result.value;
    const automaticNpmInstallOption = CliConfigOptions.AutomaticNpmInstall;
    if (!(automaticNpmInstallOption in config)) {
      return true;
    }
    return config[automaticNpmInstallOption] !== CliConfigAutomaticNpmInstall.Off;
  } catch (error: any) {
    cliLogger.warning(`Getting automatic-npm-install setting failed: ${error}`);
    return true;
  }
}

async function runTask(task: ITaskDefinition): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn(task.command, task.args || [], {
      cwd: task.cwd,
      env: task.env,
      shell: true,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      resolve(code);
    });
  });
}
