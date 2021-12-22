import { TokenCredential } from "@azure/core-auth";
import { initializeComponentAsync, registerComponent, resolveComponent } from "../internal/api";
import { ComponentContainer, InitializeOptions } from "../internal/types";
import { ComponentMetadata } from "../internal/metadata";
import { Logger } from "../util/logger";
import { AzureFunction } from "./azureFunction";
import { ApiConfiguration } from "../models/configuration";
import { getApiConfigFromEnv } from "../util/configurationProvider";

function registerApi() {
  const sqlFactory = (componentContainer: ComponentContainer, options?: InitializeOptions) => {
    const functionConfig = options as unknown as ApiConfiguration;
    const logger = componentContainer.resolve("logger") as Logger;
    const oboCredential = componentContainer.resolve("TeamsUserCredential") as TokenCredential;
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
  identifier = "default",
  params?: unknown,
  method?: "get" | "post",
  credential?: TokenCredential
): Promise<any> {
  const func = getApi(identifier);
  return await func.invoke(method ?? "get", params, credential);
}

registerApi();
