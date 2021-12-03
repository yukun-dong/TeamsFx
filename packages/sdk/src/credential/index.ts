import { initializeComponent, registerComponent, resolveComponent } from "../internal/api";
import { ComponentContainer, InitializeOptions } from "../internal/types";
import { ComponentMetadata } from "../internal/metadata";
import { AuthenticationConfiguration } from "../models/configuration";
import { InternalLogger } from "../util/logger";
import { M365TenantCredential } from "./m365TenantCredential";
import { OnBehalfOfUserCredential } from "./onBehalfOfUserCredential";
import { TokenCredential } from "@azure/core-auth";
import { getTeamsFxConfigFromEnv } from "../util/configurationProvider";

export function registerCredential() {
  const m365Factory = (componentContainer: ComponentContainer, options?: InitializeOptions) => {
    const authOption = options as AuthenticationConfiguration;
    const logger = componentContainer.resolve("logger") as InternalLogger;
    return new M365TenantCredential(authOption, logger);
  };
  registerComponent(new ComponentMetadata("M365TenantCredential", m365Factory, false));

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
  registerComponent(
    new ComponentMetadata("OnBehalfOfUserCredential", onBehalfOfUserCredentialFactory, false)
  );
}

export function initializeTeamsFx(config?: AuthenticationConfiguration, accessToken?: string) {
  const authOption = config ?? getTeamsFxConfigFromEnv();
  initializeComponent("OnBehalfOfUserCredential", {
    authOption: authOption,
    accessToken: accessToken,
  });
  initializeComponent("M365TenantCredential", { ...authOption });
}

export function getUserCredential(): TokenCredential {
  return resolveComponent("OnBehalfOfUserCredential") as OnBehalfOfUserCredential;
}

export function getAppCredential(): M365TenantCredential {
  return resolveComponent("M365TenantCredential") as M365TenantCredential;
}

export async function authorize(scopes: string | string[], credential?: TokenCredential) {
  throw new Error();
}

registerCredential();
