import { _initializeComponent, _registerComponent, _resolveComponent } from "../container/api";
import { ComponentContainer, InitializeOptions } from "../container/types";
import { ComponentMetadata } from "../container/metadata";
import { TeamsUserCredential } from "./teamsUserCredential.browser";
import { InternalLogger } from "../util/logger";
import { AuthenticationConfiguration } from "../models/configuration";
import { TokenCredential } from "@azure/core-auth";
import { getConfigFromEnv } from "../core/configurationProvider";

export function registerCredential() {
  const teamsUserCredentialfactory = (
    componentContainer: ComponentContainer,
    options?: InitializeOptions
  ) => {
    const authOption = options as AuthenticationConfiguration;
    const logger = componentContainer.resolve("logger") as InternalLogger;
    return new TeamsUserCredential(authOption, logger);
  };
  _registerComponent(
    new ComponentMetadata("TeamsUserCredential", teamsUserCredentialfactory, false)
  );
}

export function initializeCredential(config?: AuthenticationConfiguration, accessToken?: string) {
  const authOption = config ?? getConfigFromEnv();
  _initializeComponent("TeamsUserCredential", { ...authOption });
}

export function getUserCredential(): TokenCredential {
  return _resolveComponent("TeamsUserCredential") as TeamsUserCredential;
}

export async function authorize(scopes: string | string[], credential?: TokenCredential) {
  const userCredential = (credential ?? getUserCredential()) as TeamsUserCredential;
  await userCredential.login(scopes);
}

export function getAppCredential() {
  throw new Error();
}

registerCredential();
