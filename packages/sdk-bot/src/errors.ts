// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * @internal
 */
export class ErrorMessage {
  // InvalidConfiguration Error
  static readonly InvalidConfiguration = "{0} in configuration is invalid: {1}.";

  // Internal Error
  static readonly FailToAcquireTokenOnBehalfOfUser =
    "Failed to acquire access token on behalf of user: {0}";

  // ChannelNotSupported Error
  static readonly OnlyMSTeamsChannelSupported = "{0} is only supported in MS Teams Channel";
}
