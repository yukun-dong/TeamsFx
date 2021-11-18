import { _initializeComponent, _registerComponent, _resolveComponent } from "../container/api";
import { ComponentContainer, InitializeOptions } from "../container/types";
import { ComponentMetadata } from "../container/metadata";
import { AuthenticationConfiguration } from "../models/configuration";
import { InternalLogger } from "../util/logger";
import { M365TenantCredential } from "./m365TenantCredential";
import { OnBehalfOfUserCredential } from "./onBehalfOfUserCredential";

export function registerCredential() {
  const m365Factory = (componentContainer: ComponentContainer, options?: InitializeOptions) => {
    const authOption = options as AuthenticationConfiguration;
    const logger = componentContainer.resolve("logger") as InternalLogger;
    return new M365TenantCredential(authOption, logger);
  };
  _registerComponent(new ComponentMetadata("M365TenantCredential", m365Factory, false));

  const onBehalfOfUserCredentialFactory = (
    componentContainer: ComponentContainer,
    options?: InitializeOptions
  ) => {
    const { authOption, accessToken } = options as {
      authOption: AuthenticationConfiguration;
      accessToken: string;
    };
    const logger = componentContainer.resolve("logger") as InternalLogger;
    return new OnBehalfOfUserCredential(accessToken, authOption, logger);
  };
  _registerComponent(
    new ComponentMetadata("OnBehalfOfUserCredential", onBehalfOfUserCredentialFactory, false)
  );
}

export function initializeTeamsUserCredential(
  config: AuthenticationConfiguration,
  identifier = "default"
) {
  throw new Error();
}

export function getTeamsUserCredential() {
  throw new Error();
}

export function initializeM365TenantCredential(
  config: AuthenticationConfiguration,
  identifier: string
) {
  _initializeComponent("M365TenantCredential", { ...config }, identifier);
}

export function getM365TenantCredential() {
  return _resolveComponent("M365TenantCredential");
}

export function initializeOnBehalfOfUserCredential(
  config: AuthenticationConfiguration,
  accessToken: string,
  identifier = "default"
) {
  _initializeComponent(
    "OnBehalfOfUserCredential",
    { authOption: config, accessToken: accessToken },
    identifier
  );
}

export function getOnBehalfOfUserCredential() {
  return _resolveComponent("OnBehalfOfUserCredential");
}

registerCredential();
