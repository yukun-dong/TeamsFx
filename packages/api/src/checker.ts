// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IDependencyChcker {
  /**
   * Ensure dependencies installed.
   * @param dependencies Dependency types. If it is empty, do nothing.
   * @param fastFail Default value: false.
   */
  ensureDependencies(dependencies: DependencyType[], fastFail: boolean): Promise<DependencyStatus>;
}

export enum DependencyType {
  Dotnet = "dotnet",
  FuncCoreTools = "func-core-tools",
  Bicep = "bicep",
  AzureNode = "azure-node",
  SpfxNode = "spfx-node",
  Ngrok = "ngrok",
}

export type DependencyStatus = {
  name: DependencyType;
  isInstalled: boolean;
  isLinuxSupported: boolean;
  command: string;
  supportedVersions: string[];
  errorName: string;
  errorMsg: string;
  learnMore: string;
};
