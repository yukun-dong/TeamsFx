// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SqlConfiguration } from "../models/configuration";
// import { ResourceType } from "../models/configuration";
import { AccessToken, ManagedIdentityCredential } from "@azure/identity";
import { ConnectionConfig } from "tedious";
import { Logger } from "../util/logger";
import { ErrorWithCode, ErrorCode } from "../errors";

/**
 * SQL connection configuration instance.
 * @remarks
 * Only works in in server side.
 *
 * @beta
 *
 */
export class DefaultTediousConnectionConfiguration {
  /**
   * MSSQL default scope
   * https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-connect-msi
   */
  private readonly defaultSQLScope: string = "https://database.windows.net/";
  private logger: Logger;
  private configuration: SqlConfiguration;

  public constructor(config: SqlConfiguration, logger: Logger) {
    this.logger = logger;
    this.configuration = config;
  }

  /**
   * Generate connection configuration consumed by tedious.
   *
   * @returns Connection configuration of tedious for the SQL.
   *
   * @throws {@link ErrorCode|InvalidConfiguration} when SQL config resource configuration is invalid.
   * @throws {@link ErrorCode|InternalError} when get user MSI token failed or MSI token is invalid.
   * @throws {@link ErrorCode|RuntimeNotSupported} when runtime is browser.
   *
   * @beta
   */
  public async getConfig(): Promise<ConnectionConfig> {
    this.logger.info("Get SQL configuration");
    const configuration = this.configuration;

    if (!configuration) {
      const errMsg = "SQL resource configuration not exist";
      this.logger.error(errMsg);
      throw new ErrorWithCode(errMsg, ErrorCode.InvalidConfiguration);
    }

    try {
      this.isSQLConfigurationValid(configuration);
    } catch (err) {
      throw err;
    }

    if (!this.isMsiAuthentication()) {
      const configWithUPS = this.generateDefaultConfig(configuration);
      this.logger.verbose("SQL configuration with username and password generated");
      return configWithUPS;
    }

    try {
      const configWithToken = await this.generateTokenConfig(configuration);
      this.logger.verbose("SQL configuration with MSI token generated");
      return configWithToken;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check SQL use MSI identity or username and password.
   *
   * @returns false - login with SQL MSI identity, true - login with username and password.
   * @internal
   */
  private isMsiAuthentication(): boolean {
    this.logger.verbose("Check connection config using MSI access token or username and password");
    const configuration = this.configuration;
    if (configuration?.sqlUsername != null && configuration?.sqlPassword != null) {
      this.logger.verbose("Login with username and password");
      return false;
    }
    this.logger.verbose("Login with MSI identity");
    return true;
  }

  /**
   * check configuration is an available configurations.
   * @param { SqlConfiguration } sqlConfig
   *
   * @returns true - SQL configuration has a valid SQL endpoints, SQL username with password or identity ID.
   *          false - configuration is not valid.
   * @internal
   */
  private isSQLConfigurationValid(sqlConfig: SqlConfiguration) {
    this.logger.verbose("Check SQL configuration if valid");
    if (!sqlConfig.sqlServerEndpoint) {
      this.logger.error("SQL configuration is not valid without SQL server endpoint exist");
      throw new ErrorWithCode(
        "SQL configuration error without SQL server endpoint exist",
        ErrorCode.InvalidConfiguration
      );
    }
    if (!(sqlConfig.sqlUsername && sqlConfig.sqlPassword) && !sqlConfig.sqlIdentityId) {
      const errMsg = `SQL configuration is not valid without ${
        sqlConfig.sqlIdentityId ? "" : "identity id "
      } ${sqlConfig.sqlUsername ? "" : "SQL username "} ${
        sqlConfig.sqlPassword ? "" : "SQL password"
      } exist`;
      this.logger.error(errMsg);
      throw new ErrorWithCode(errMsg, ErrorCode.InvalidConfiguration);
    }
    this.logger.verbose("SQL configuration is valid");
  }

  /**
   * Generate tedious connection configuration with default authentication type.
   *
   * @param { SqlConfiguration } SQL configuration with username and password.
   *
   * @returns Tedious connection configuration with username and password.
   * @internal
   */
  private generateDefaultConfig(sqlConfig: SqlConfiguration): ConnectionConfig {
    this.logger.verbose(
      `SQL server ${sqlConfig.sqlServerEndpoint}, user name ${sqlConfig.sqlUsername}, database name ${sqlConfig.sqlDatabaseName}`
    );

    const config = {
      server: sqlConfig.sqlServerEndpoint,
      authentication: {
        type: TediousAuthenticationType.default,
        options: {
          userName: sqlConfig.sqlUsername,
          password: sqlConfig.sqlPassword,
        },
      },
      options: {
        database: sqlConfig.sqlDatabaseName,
        encrypt: true,
      },
    };
    return config;
  }

  /**
   * Generate tedious connection configuration with azure-active-directory-access-token authentication type.
   *
   * @param { SqlConfiguration } SQL configuration with AAD access token.
   *
   * @returns Tedious connection configuration with access token.
   * @internal
   */
  private async generateTokenConfig(sqlConfig: SqlConfiguration): Promise<ConnectionConfig> {
    this.logger.verbose("Generate tedious config with MSI token");

    let token: AccessToken | null;
    try {
      const credential = new ManagedIdentityCredential(sqlConfig.sqlIdentityId!);
      token = await credential.getToken(this.defaultSQLScope);
    } catch (error) {
      const errMsg = "Get user MSI token failed";
      this.logger.error(errMsg);
      throw new ErrorWithCode(errMsg, ErrorCode.InternalError);
    }
    if (token) {
      const config = {
        server: sqlConfig.sqlServerEndpoint,
        authentication: {
          type: TediousAuthenticationType.MSI,
          options: {
            token: token.token,
          },
        },
        options: {
          database: sqlConfig.sqlDatabaseName,
          encrypt: true,
        },
      };
      this.logger.verbose(
        `Generate token configuration success, server endpoint is ${sqlConfig.sqlServerEndpoint}, database name is ${sqlConfig.sqlDatabaseName}`
      );
      return config;
    }
    this.logger.error(
      `Generate token configuration, server endpoint is ${sqlConfig.sqlServerEndpoint}, MSI token is not valid`
    );
    throw new ErrorWithCode("MSI token is not valid", ErrorCode.InternalError);
  }
}

/**
 * tedious connection config authentication type.
 * https://tediousjs.github.io/tedious/api-connection.html
 * @internal
 */
enum TediousAuthenticationType {
  default = "default",
  MSI = "azure-active-directory-access-token",
}
