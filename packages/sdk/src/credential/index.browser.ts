import { initializeComponent, registerComponent, resolveComponent } from "../internal/api";
import { ComponentContainer, InitializeOptions } from "../internal/types";
import { ComponentMetadata } from "../internal/metadata";
import { TeamsUserCredential } from "./teamsUserCredential.browser";
import { InternalLogger } from "../util/logger";
import { AuthenticationConfiguration } from "../models/configuration";
import { TokenCredential } from "@azure/core-auth";
import { getTeamsFxConfigFromEnv } from "../util/configurationProvider";

export function registerCredential() {
  const teamsUserCredentialfactory = (
    componentContainer: ComponentContainer,
    options?: InitializeOptions
  ) => {
    const authOption = options as AuthenticationConfiguration;
    const logger = componentContainer.resolve("logger") as InternalLogger;
    return new TeamsUserCredential(authOption, logger);
  };
  registerComponent(
    new ComponentMetadata("TeamsUserCredential", teamsUserCredentialfactory, false)
  );
}

export function initializeTeamsFx(config?: AuthenticationConfiguration, accessToken?: string) {
  const authOption = config ?? getTeamsFxConfigFromEnv();
  initializeComponent("TeamsUserCredential", { ...authOption });
}

export function getUserCredential(): TokenCredential {
  return resolveComponent("TeamsUserCredential") as TeamsUserCredential;
}

export async function authorize(scopes: string | string[], credential?: TokenCredential) {
  const userCredential = (credential ?? getUserCredential()) as TeamsUserCredential;
  await userCredential.login(scopes);
}

export function getAppCredential() {
  throw new Error();
}

registerCredential();
