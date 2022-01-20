// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { TokenCredential } from "@azure/identity";
import { M365TenantCredential } from "../credential/m365TenantCredential";
import { OnBehalfOfUserCredential } from "../credential/onBehalfOfUserCredential";
import { IdentityType } from "../models/identityType";
import { UserInfo } from "../models/userinfo";
import { formatString } from "../util/utils";
import { ErrorWithCode, ErrorCode, ErrorMessage } from "../core/errors";
import { internalLogger } from "../util/logger";

export class TeamsFx {
  private configuration: Map<string, string | undefined>;
  private oboUserCredential?: OnBehalfOfUserCredential;
  private appCredential?: M365TenantCredential;
  public identityType: IdentityType;

  constructor(identityType?: IdentityType) {
    this.identityType = identityType ?? IdentityType.User;
    this.configuration = new Map<string, string>();
    this.loadFromEnv();
  }

  private loadFromEnv(): void {
    const env = process.env;
    this.configuration.set("authorityHost", env.M365_AUTHORITY_HOST);
    this.configuration.set("tenantId", env.M365_TENANT_ID);
    this.configuration.set("clientId", env.M365_CLIENT_ID);
    this.configuration.set("clientSecret", env.M365_CLIENT_SECRET);
    this.configuration.set("initiateLoginEndpoint", env.INITIATE_LOGIN_ENDPOINT);
    this.configuration.set("applicationIdUri", env.M365_APPLICATION_ID_URI);
    this.configuration.set("endpoint", env.API_ENDPOINT);
    this.configuration.set("sqlServerEndpoint", env.SQL_ENDPOINT);
    this.configuration.set("sqlUsername", env.SQL_USER_NAME);
    this.configuration.set("sqlPassword", env.SQL_PASSWORD);
    this.configuration.set("sqlDatabaseName", env.SQL_DATABASE_NAME);
    this.configuration.set("sqlIdentityId", env.IDENTITY_ID);

    Object.keys(env).forEach((key: string) => {
      const value = env[key];
      if (key.startsWith("TEAMSFX_") && value) {
        this.configuration.set(key.substring(8), value);
      }
    });
  }

  public get Credential(): TokenCredential {
    if (this.identityType === IdentityType.User) {
      if (this.oboUserCredential) {
        return this.oboUserCredential;
      }
      throw new Error();
    } else {
      if (!this.appCredential) {
        this.appCredential = new M365TenantCredential(Object.fromEntries(this.configuration));
      }
      return this.appCredential;
    }
  }

  public async getUserInfo(): Promise<UserInfo> {
    if (this.identityType !== IdentityType.User) {
      const errorMsg = formatString(
        ErrorMessage.IdentityTypeNotSupported,
        this.identityType.toString(),
        "TeamsFx"
      );
      internalLogger.error(errorMsg);
      throw new ErrorWithCode(errorMsg, ErrorCode.IdentityTypeNotSupported);
    }
    return (this.Credential as OnBehalfOfUserCredential).getUserInfo();
  }

  public async login(scopes: string | string[]): Promise<void> {
    throw new ErrorWithCode(
      formatString(ErrorMessage.NodejsRuntimeNotSupported, "login"),
      ErrorCode.RuntimeNotSupported
    );
  }

  public setSsoToken(ssoToken: string): TeamsFx {
    if (this.identityType !== IdentityType.User) {
      throw new Error();
    }
    this.oboUserCredential = new OnBehalfOfUserCredential(
      ssoToken,
      Object.fromEntries(this.configuration)
    );
    return this;
  }

  public setCustomConfig(customConfig: Map<string, string>): TeamsFx {
    for (const key of customConfig.keys()) {
      const value = customConfig.get(key);
      if (value) {
        this.configuration.set(key, value);
      }
    }
    this.oboUserCredential = undefined;
    this.appCredential = undefined;
    return this;
  }

  public getConfig(key: string): string {
    const value = this.configuration.get(key);
    if (!value) {
      throw new Error();
    }
    return value;
  }

  public hasConfig(key: string): boolean {
    const value = this.configuration.get(key);
    return !!value;
  }

  public getConfigs(): Record<string, string> {
    const config: Record<string, string> = {};
    for (const key of this.configuration.keys()) {
      const value = this.configuration.get(key);
      if (value) {
        config[key] = value;
      }
    }
    return config;
  }
}
