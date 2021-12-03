// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Authentication related configuration.
 * @beta
 */
export interface AuthenticationConfiguration {
  /**
   * Hostname of AAD authority. Default value comes from M365_AUTHORITY_HOST environment variable.
   *
   * @readonly
   */
  readonly authorityHost?: string;

  /**
   * AAD tenant id, default value comes from M365_TENANT_ID environment variable.
   *
   * @readonly
   */
  readonly tenantId?: string;

  /**
   * The client (application) ID of an App Registration in the tenant, default value comes from M365_CLIENT_ID environment variable
   *
   * @readonly
   */
  readonly clientId?: string;

  /**
   * Secret string that the application uses when requesting a token. Only used in confidential client applications. Can be created in the Azure app registration portal. Default value comes from M365_CLIENT_SECRET environment variable
   *
   * @readonly
   */
  readonly clientSecret?: string;

  /**
   * The content of a PEM-encoded public/private key certificate.
   *
   * @readonly
   */
  readonly certificateContent?: string;

  /**
   * Endpoint of auth service provisioned by Teams Framework. Default value comes from SIMPLE_AUTH_ENDPOINT environment variable.
   *
   * @readonly
   */
  readonly simpleAuthEndpoint?: string;

  /**
   * Login page for Teams to redirect to.  Default value comes from INITIATE_LOGIN_ENDPOINT environment variable.
   *
   * @readonly
   */
  readonly initiateLoginEndpoint?: string;

  /**
   * Application ID URI. Default value comes from M365_APPLICATION_ID_URI environment variable.
   */
  readonly applicationIdUri?: string;
}

/**
 * Configuration for SQL resource.
 * @internal
 */
export interface SqlConfiguration {
  /**
   * SQL server endpoint.
   *
   * @readonly
   */
  readonly sqlServerEndpoint?: string;

  /**
   * SQL server username.
   *
   * @readonly
   */
  readonly sqlUsername?: string;

  /**
   * SQL server password.
   *
   * @readonly
   */
  readonly sqlPassword?: string;

  /**
   * SQL server database name.
   *
   * @readonly
   */
  readonly sqlDatabaseName?: string;

  /**
   * Managed identity id.
   *
   * @readonly
   */
  readonly sqlIdentityId?: string;
}

/**
 * Configuration for Azure Function resource.
 * @internal
 */
export interface ApiConfiguration {
  /**
   * Name of the function in endpoint.
   *
   * @readonly
   */
  readonly functionName?: string;

  /**
   * Function endpoint.
   *
   * @readonly
   */
  readonly functionEndpoint?: string;
}
