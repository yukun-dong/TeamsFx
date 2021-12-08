// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DotnetChecker } from "./internal/dotnetChecker";
import { DepsLogger } from "./depsLogger";
import { DepsTelemetry } from "./depsTelemetry";
import { DepsChecker } from "./depsChecker";
import { AzureNodeChecker, SPFxNodeChecker } from "./internal/nodeChecker";
import { FuncToolChecker } from "./internal/funcToolChecker";
import { NgrokChecker } from "./internal/ngrokChecker";

export function newAzureNodeChecker(logger: DepsLogger, telemetry: DepsTelemetry): DepsChecker {
  return new AzureNodeChecker(logger, telemetry);
}

export function newSPFxNodeChecker(logger: DepsLogger, telemetry: DepsTelemetry): DepsChecker {
  return new SPFxNodeChecker(logger, telemetry);
}

export function newDotnetChecker(logger: DepsLogger, telemetry: DepsTelemetry): DepsChecker {
  return new DotnetChecker(logger, telemetry);
}

export function newNgrokChecker(logger: DepsLogger, telemetry: DepsTelemetry): DepsChecker {
  return new NgrokChecker(logger, telemetry);
}

export function newFuncToolChecker(logger: DepsLogger, telemetry: DepsTelemetry): DepsChecker {
  return new FuncToolChecker(logger, telemetry);
}
