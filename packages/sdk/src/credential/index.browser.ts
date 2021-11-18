import { _initializeComponent, _registerComponent, _resolveComponent } from "../container/api";
import { ComponentContainer, InitializeOptions } from "../container/types";
import { ComponentMetadata } from "../container/metadata";
import { TeamsUserCredential } from "./teamsUserCredential.browser";
import { InternalLogger } from "../util/logger";
import { AuthenticationConfiguration } from "../models/configuration";

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

export function initializeTeamsUserCredential(
  config: AuthenticationConfiguration,
  identifier = "default"
) {
  _initializeComponent("TeamsUserCredential", { ...config }, identifier);
}

export function getTeamsUserCredential() {
  return _resolveComponent("TeamsUserCredential");
}

registerCredential();
