// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface DependencyChcker {
  ensureDependencies(dependencies: DependencyType[]): Promise<DependencyStatus>;
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
  dependecy: DependencyType;
  isEnabled: boolean;
  isInstalled: boolean;
  isLinuxSupported: boolean;
  command: string;
  errorName: string;
  errorMsg: string;
};
