// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { registerLogger } from "./util/logger";

export { ErrorWithCode, ErrorCode } from "./errors";

export {
  getTeamsFxConfigFromEnv,
  getApiConfigFromEnv,
  getSqlConfigFromEnv,
} from "./util/configurationProvider";

// credential
export { M365TenantCredential } from "./credential/m365TenantCredential";
export { OnBehalfOfUserCredential } from "./credential/onBehalfOfUserCredential";
export { TeamsUserCredential } from "./credential/teamsUserCredential";

export {
  initializeTeamsFx,
  getUserCredential,
  getAppCredential,
  authorize,
} from "./credential/index";

// graph
export { MsGraphAuthProvider } from "./graph/msGraphAuthProvider";
export { getMicrosoftGraphClient } from "./graph/msGraphClientProvider";
export { DefaultTediousConnectionConfiguration } from "./sql/defaultTediousConnectionConfiguration";

// sql
export { initializeSqlAsync, getSqlConnection, connect, execQuery, close } from "./sql";

export { TeamsBotSsoPrompt, TeamsBotSsoPromptSettings } from "./bot/teamsBotSsoPrompt";
export { TeamsBotSsoPromptTokenResponse } from "./bot/teamsBotSsoPromptTokenResponse";

// model
export { UserInfo } from "./models/userinfo";
export {
  AuthenticationConfiguration,
  ApiConfiguration,
  SqlConfiguration,
} from "./models/configuration";

export {
  Logger,
  LogLevel,
  LogFunction,
  setLogLevel,
  getLogLevel,
  setLogger,
  setLogFunction,
} from "./util/logger";

export { initializeApi, getApi, callApi } from "./api";

registerLogger();
