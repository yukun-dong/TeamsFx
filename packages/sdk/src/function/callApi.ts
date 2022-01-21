// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ErrorWithCode, ErrorCode } from "../core/errors";
import { internalLogger } from "../util/logger";
import { TeamsFx } from "../core/teamsfx";
import * as axios from "axios";

export async function callApi(
  teamsfx: TeamsFx,
  functionName?: string,
  params?: any,
  method?: "get" | "post"
): Promise<any> {
  const apiEndpoint = teamsfx.getConfig("apiEndpoint");
  const apiName = functionName ?? teamsfx.hasConfig("apiName") ? teamsfx.getConfig("apiName") : "";
  const httpMethod = method ?? "get";
  if (apiName === "") {
    const errMsg = `Function name is not valid. Please call with valid one or set apiName variable.`;
    internalLogger.error(errMsg);
    throw new ErrorWithCode(errMsg, ErrorCode.InvalidParameter);
  }
  try {
    const accessToken = await teamsfx.Credential.getToken("");
    if (httpMethod === "get") {
      const response = await axios.default.get(apiEndpoint + "/api/" + apiName, {
        headers: {
          authorization: "Bearer " + accessToken?.token || "",
        },
        params: params,
      });
      return response.data;
    } else if (httpMethod === "post") {
      const response = await axios.default.post(apiEndpoint + "/api/" + apiName, params, {
        headers: {
          authorization: "Bearer " + accessToken?.token || "",
        },
      });
      return response.data;
    } else {
      throw new ErrorWithCode("Unsupported HTTP method", ErrorCode.InvalidParameter);
    }
  } catch (err: unknown) {
    if (axios.default.isAxiosError(err)) {
      let funcErrorMsg = "";

      if (err?.response?.status === 404) {
        funcErrorMsg = `There may be a problem with the deployment of Azure Function App, please deploy Azure Function (Run command palette "Teams: Deploy to the cloud") first before running this App`;
        internalLogger.error(funcErrorMsg);
        throw new ErrorWithCode(funcErrorMsg, ErrorCode.FailedOperation);
      } else if (err.message === "Network Error") {
        funcErrorMsg = `Cannot call Azure Function due to network error, please check your network connection status`;
        internalLogger.error(funcErrorMsg);
        throw new ErrorWithCode(funcErrorMsg, ErrorCode.FailedOperation);
      } else {
        funcErrorMsg = err.message;
        if (err.response?.data?.error) {
          funcErrorMsg += ": " + err.response.data.error;
        }
        internalLogger.error(funcErrorMsg);
        throw new ErrorWithCode(funcErrorMsg, ErrorCode.InternalError);
      }
    }
    throw new ErrorWithCode("Failed to call API", ErrorCode.InternalError);
  }
}
