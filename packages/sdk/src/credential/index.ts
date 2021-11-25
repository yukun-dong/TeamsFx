import { _initializeComponent, _registerComponent, _resolveComponent } from "../container/api";
import { ComponentContainer, InitializeOptions } from "../container/types";
import { ComponentMetadata } from "../container/metadata";
import { AuthenticationConfiguration } from "../models/configuration";
import { InternalLogger } from "../util/logger";
import { M365TenantCredential } from "./m365TenantCredential";
import { OnBehalfOfUserCredential } from "./onBehalfOfUserCredential";
import { TokenCredential } from "@azure/core-auth";
import { getConfigFromEnv } from "../core/configurationProvider";

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

export function initializeCredential(config?: AuthenticationConfiguration, accessToken?: string) {
  const authOption = config ?? getConfigFromEnv();
  _initializeComponent("OnBehalfOfUserCredential", {
    authOption: authOption,
    accessToken: accessToken,
  });
  _initializeComponent("M365TenantCredential", { ...authOption });
}

export function getUserCredential(): TokenCredential {
  return _resolveComponent("OnBehalfOfUserCredential") as OnBehalfOfUserCredential;
}

export function getAppCredential(): M365TenantCredential {
  return _resolveComponent("M365TenantCredential") as M365TenantCredential;
}

export async function authorize(scopes: string | string[], credential?: TokenCredential) {
  throw new Error();
}

registerCredential();
