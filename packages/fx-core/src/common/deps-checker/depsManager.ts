// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DepsLogger } from "./depsLogger";
import { DepsTelemetry } from "./depsTelemetry";
import { DepsType, DepsChecker, DepsInfo } from "./depsChecker";
import { CheckerFactory } from "./checkerFactory";

export type DepsOptions = {
  fastFail?: boolean;
};

export type DependencyStatus = {
  name: DepsType;
  isInstalled: boolean;
  command: string;
  details: {
    isLinuxSupported: boolean;
    supportedVersions: string[];
  };
  error?: {
    errorName: string;
    errorMsg: string;
    helpLink: string;
  };
};

export class DepsManager {
  private static readonly _depsOrders = [
    DepsType.AzureNode,
    DepsType.FunctionNode,
    DepsType.SpfxNode,
    DepsType.Dotnet,
    DepsType.FuncCoreTools,
    DepsType.Ngrok,
  ];

  private readonly _logger;
  private readonly _telemetry;

  constructor(logger: DepsLogger, telemetry: DepsTelemetry) {
    if (!logger) {
      throw Error("Logger is undefined.");
    }
    if (!telemetry) {
      throw Error("Logger is undefined.");
    }

    this._logger = logger;
    this._telemetry = telemetry;
  }

  /**
   * Ensure dependencies installed.
   * Installation Orders:
   *      Node, Dotnet, FuncCoreTools, Ngrok
   * @param dependencies Dependency types. If it is empty, do nothing.
   * @param options If fastFail is false, it will continue even if one of the dependencies fails to install. Default value  is true
   */
  public async ensureDependencies(
    dependencies: DepsType[],
    options: DepsOptions
  ): Promise<DependencyStatus[]> {
    if (!dependencies || dependencies.length == 0) {
      return [];
    }

    const orderedDeps: DepsType[] = this.sortBySequence(dependencies, DepsManager._depsOrders);
    const result: DependencyStatus[] = [];
    for (const type of orderedDeps) {
      const status: DependencyStatus = await this.resolve(type);
      result.push(status);
    }
    return result;
  }

  private async resolve(type: DepsType): Promise<DependencyStatus> {
    const checker = CheckerFactory.createChecker(type, this._logger, this._telemetry);
    // TODO
    const result = await checker.resolve();

    const depsInfo: DepsInfo = await checker.getDepsInfo();
    return {
      name: type,
      isInstalled: result,
      command: await checker.command(),
      details: {
        isLinuxSupported: depsInfo.isLinuxSupported,
        supportedVersions: depsInfo.supportedVersions,
      },
    };
  }

  private sortBySequence(dependencies: DepsType[], sequence: DepsType[]): DepsType[] {
    return dependencies
      .filter((value) => value != null)
      .sort((a, b) => sequence.indexOf(a) - sequence.indexOf(b));
  }
}
