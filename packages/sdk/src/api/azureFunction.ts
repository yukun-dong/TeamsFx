// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as axios from "axios";
import { TokenCredential } from "@azure/core-auth";
import { ApiConfiguration } from "../models/configuration";
import { Logger } from "../util/logger";
import { ErrorWithCode, ErrorCode } from "../errors";

export class AzureFunction {
  private logger: Logger;
  private configuration: ApiConfiguration;
  private tokenCredential: TokenCredential;

  public constructor(tokenCredential: TokenCredential, config: ApiConfiguration, logger: Logger) {
    this.tokenCredential = tokenCredential;
    this.logger = logger;
    this.configuration = config;
  }

  public async invoke(method: "get" | "post", params?: unknown, credential?: TokenCredential) {
    try {
      const accessToken = await (credential ?? this.tokenCredential).getToken("");
      const headers: axios.AxiosRequestHeaders = {
        authorization: "Bearer " + accessToken?.token || "",
      };
      const url = this.configuration.functionEndpoint + "/api/" + this.configuration.functionName;
      if (method === "get") {
        const response = await axios.default.get(url, {
          headers: headers,
        });
        return response.data;
      } else if (method === "post") {
        const response = await axios.default.post(url, params, {
          headers: headers,
        });
        return response.data;
      }
    } catch (err: unknown) {
      if (axios.default.isAxiosError(err)) {
        let funcErrorMsg = "";

        if (err?.response?.status === 404) {
          funcErrorMsg = `There may be a problem with the deployment of Azure Function App, please deploy Azure Function (Run command palette "Teams: Deploy to the cloud") first before running this App`;
        } else if (err.message === "Network Error") {
          funcErrorMsg =
            "Cannot call Azure Function due to network error, please check your network connection status and ";
          if (err.config?.url && err.config.url.indexOf("localhost") >= 0) {
            funcErrorMsg += `make sure to start Azure Function locally (Run "npm run start" command inside api folder from terminal) first before running this App`;
          } else {
            funcErrorMsg += `make sure to provision and deploy Azure Function (Run command palette "Teams: Provision in the cloud" and "Teams: Deploy to the cloud) first before running this App`;
          }
        } else {
          funcErrorMsg = err.message;
          if (err.response?.data?.error) {
            funcErrorMsg += ": " + err.response.data.error;
          }
        }

        throw new Error(funcErrorMsg);
      }
      throw err;
    }
  }
}
