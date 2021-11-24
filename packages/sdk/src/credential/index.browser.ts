import { _initializeComponent, _registerComponent, _resolveComponent } from "../container/api";
import { ComponentContainer, InitializeOptions } from "../container/types";
import { ComponentMetadata } from "../container/metadata";
import { TeamsUserCredential } from "./teamsUserCredential.browser";
import { InternalLogger } from "../util/logger";
import { AuthenticationConfiguration } from "../models/configuration";
import { TokenCredential } from "@azure/core-auth";

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

export function initializeCredential(config: AuthenticationConfiguration, accessToken?: string) {
  _initializeComponent("TeamsUserCredential", { ...config });
}

export function getUserCredential(): TokenCredential {
  return _resolveComponent("TeamsUserCredential") as TeamsUserCredential;
}

export function getAppCredential() {
  throw new Error();
}

registerCredential();
