import { initializeComponent, registerComponent, resolveComponent } from "../internal/api";
import { ComponentContainer, InitializeOptions } from "../internal/types";
import { ComponentMetadata } from "../internal/metadata";
import { AuthenticationConfiguration } from "../models/configuration";
import { InternalLogger } from "../util/logger";
import { AppCredential } from "./appCredential";
import { OnBehalfOfUserCredential } from "./onBehalfOfUserCredential";
import { TokenCredential } from "@azure/core-auth";
import { getTeamsFxConfigFromEnv } from "../util/configurationProvider";

export function registerCredential() {
  const m365Factory = (componentContainer: ComponentContainer, options?: InitializeOptions) => {
    const authOption = options as AuthenticationConfiguration;
    const logger = componentContainer.resolve("logger") as InternalLogger;
    return new AppCredential(authOption, logger);
  };
  registerComponent(new ComponentMetadata("AppCredential", m365Factory, false));

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
  initializeComponent("AppCredential", { ...authOption });
}

export function getUserCredential(): TokenCredential {
  return resolveComponent("OnBehalfOfUserCredential") as OnBehalfOfUserCredential;
}

export function getAppCredential(): AppCredential {
  return resolveComponent("AppCredential") as AppCredential;
}

export async function authorize(scopes: string | string[], credential?: TokenCredential) {
  throw new Error();
}

registerCredential();
