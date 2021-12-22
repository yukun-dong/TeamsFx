// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export enum DependencyType {
  AzureNode = "azure-node",
  FunctionNode = "function-node",
  SpfxNode = "spfx-node",
  Dotnet = "dotnet",
  FuncCoreTools = "func-core-tools",
  Ngrok = "ngrok",
}

export type DepsOptions = {
  fastFail?: boolean;
};

export class DepsManager {
  private static readonly _depsOrders = [
    DependencyType.AzureNode,
    DependencyType.FunctionNode,
    DependencyType.SpfxNode,
    DependencyType.Dotnet,
    DependencyType.FuncCoreTools,
    DependencyType.Ngrok,
  ];

  /**
   * Ensure dependencies installed.
   * Installation Orders:
   *      Node, Dotnet, FuncCoreTools, Ngrok
   * @param dependencies Dependency types. If it is empty, do nothing.
   * @param options If fastFail is false, it will continue even if one of the dependencies fails to install. Default value  is true
   */
  public async ensureDependencies(
    dependencies: DependencyType[],
    options: DepsOptions
  ): Promise<DependencyStatus[]> {
    const orderedDeps = this.sortBySequence(dependencies, DepsManager._depsOrders);
    // todo
    return [];
  }

  private sortBySequence(
    dependencies: DependencyType[],
    sequence: DependencyType[]
  ): DependencyType[] {
    return dependencies
      .filter((value) => value != null)
      .sort((a, b) => sequence.indexOf(a) - sequence.indexOf(b));
  }
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
