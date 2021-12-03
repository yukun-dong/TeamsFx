import { TokenCredential } from "@azure/core-auth";
import { getApiConfigFromEnv } from "../util/configurationProvider";
import {
  initializeComponentAsync,
  registerComponent,
  resolveComponent,
  ComponentContainer,
  ComponentMetadata,
  InitializeOptions,
} from "../internal";
import { Logger } from "../util/logger";
import { AzureFunction } from "./azureFunction";
import { ApiConfiguration } from "../models/configuration";

function registerApi() {
  const sqlFactory = async (
    componentContainer: ComponentContainer,
    options?: InitializeOptions
  ) => {
    const functionConfig = options as unknown as ApiConfiguration;
    const logger = componentContainer.resolve("logger") as Logger;
    const oboCredential = componentContainer.resolve("OnBehalfOfUserCredential") as TokenCredential;
    return new AzureFunction(oboCredential, functionConfig, logger);
  };
  registerComponent(new ComponentMetadata("Api", sqlFactory, false));
}

export async function initializeApi(config?: ApiConfiguration, identifier = "default") {
  config = config ?? getApiConfigFromEnv();
  await initializeComponentAsync("Api", { ...config }, identifier);
}

export function getApi(identifier = "default"): AzureFunction {
  return resolveComponent("Api", identifier) as AzureFunction;
}

export async function callApi(
  params?: unknown,
  method?: "get" | "post",
  azureFunction?: AzureFunction,
  credential?: TokenCredential
): Promise<any> {
  const func = azureFunction ?? getApi();
  await func.invoke(method ?? "get", params, credential);
}

registerApi();
