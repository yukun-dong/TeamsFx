// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  AuthenticationConfiguration,
  ApiConfiguration,
  SqlConfiguration,
} from "../models/configuration";
import { isNode } from "./utils";

export function getTeamsFxConfigFromEnv(): AuthenticationConfiguration {
  if (isNode) {
    return {
      authorityHost: process.env.M365_AUTHORITY_HOST,
      tenantId: process.env.M365_TENANT_ID,
      clientId: process.env.M365_CLIENT_ID,
      clientSecret: process.env.M365_CLIENT_SECRET,
      simpleAuthEndpoint: process.env.SIMPLE_AUTH_ENDPOINT,
      initiateLoginEndpoint: process.env.INITIATE_LOGIN_ENDPOINT,
      applicationIdUri: process.env.M365_APPLICATION_ID_URI,
    };
  } else {
    return {
      authorityHost: process.env.REACT_APP_AUTHORITY_HOST,
      tenantId: process.env.REACT_APP_TENANT_ID,
      clientId: process.env.REACT_APP_CLIENT_ID,
      simpleAuthEndpoint: process.env.REACT_APP_TEAMSFX_ENDPOINT,
      initiateLoginEndpoint: process.env.REACT_APP_START_LOGIN_PAGE_URL,
      applicationIdUri: process.env.M365_APPLICATION_ID_URI,
    };
  }
}

export function getApiConfigFromEnv(): ApiConfiguration {
  if (isNode) {
    return {
      functionEndpoint: process.env.API_ENDPOINT,
      functionName: process.env.API_NAME,
    };
  } else {
    return {
      functionEndpoint: process.env.REACT_APP_FUNC_ENDPOINT,
      functionName: process.env.REACT_APP_FUNC_NAME,
    };
  }
}

export function getSqlConfigFromEnv(): SqlConfiguration {
  return {
    sqlServerEndpoint: process.env.SQL_ENDPOINT,
    sqlUsername: process.env.SQL_USER_NAME,
    sqlPassword: process.env.SQL_PASSWORD,
    sqlDatabaseName: process.env.SQL_DATABASE_NAME,
    sqlIdentityId: process.env.IDENTITY_ID,
  };
}
