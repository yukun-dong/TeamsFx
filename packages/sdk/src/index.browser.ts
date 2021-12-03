// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { registerLogger } from "./util/logger";

export { ErrorWithCode, ErrorCode } from "./errors";

export { getTeamsFxConfigFromEnv } from "./util/configurationProvider";

export { M365TenantCredential } from "./credential/m365TenantCredential.browser";
export { OnBehalfOfUserCredential } from "./credential/onBehalfOfUserCredential.browser";
export { TeamsUserCredential } from "./credential/teamsUserCredential.browser";

export { MsGraphAuthProvider } from "./graph/msGraphAuthProvider";
export { getMicrosoftGraphClient } from "./graph/msGraphClientProvider.browser";
export { DefaultTediousConnectionConfiguration } from "./sql/defaultTediousConnectionConfiguration";

export { TeamsBotSsoPrompt, TeamsBotSsoPromptSettings } from "./bot/teamsBotSsoPrompt.browser";
export { TeamsBotSsoPromptTokenResponse } from "./bot/teamsBotSsoPromptTokenResponse";

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

export {
  initializeTeamsFx,
  getUserCredential,
  getAppCredential,
  authorize,
} from "./credential/index.browser";

export { initializeApi, getApi, callApi } from "./api/index.browser";

registerLogger();
