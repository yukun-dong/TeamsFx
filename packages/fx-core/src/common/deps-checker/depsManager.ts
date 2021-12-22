// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Ensure dependencies installed.
 * Order: todo
 * @param dependencies Dependency types. If it is empty, do nothing.
 * @param options If fastFail is false, it will continue even if one of the dependencies fails to install. Default value  is true
 */
export async function ensureDependencies(
  dependencies: DependencyType[],
  options: DepsOptions
): Promise<DependencyStatus[]> {
  // todo
  return [];
}

export type DepsOptions = {
  // source: string; todo
  fastFail?: boolean;
};

export enum DependencyType {
  AzureNode = "azure-node",
  FunctionNode = "function-node",
  SpfxNode = "spfx-node",
  Dotnet = "dotnet",
  FuncCoreTools = "func-core-tools",
  Ngrok = "ngrok",
}

export type DependencyStatus = {
  name: DependencyType;
  isInstalled: boolean;
  depsInfo: {
    command: string;
    isLinuxSupported: boolean;
    supportedVersions: string[];
    learnMore: string;
  };
  error: {
    errorName: string;
    errorMsg: string;
  };
};
