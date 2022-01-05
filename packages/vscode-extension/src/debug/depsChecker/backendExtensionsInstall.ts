// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  defaultHelpLink,
  DepsType,
  DepsCheckerError,
  Messages,
  installExtension,
} from "@microsoft/teamsfx-core";
import { VSCodeDepsChecker } from "./vscodeChecker";
import { vscodeLogger } from "./vscodeLogger";
import { vscodeTelemetry } from "./vscodeTelemetry";

export async function installBackendExtension(backendRoot: string): Promise<boolean> {
  const vscodeDepsChecker = new VSCodeDepsChecker(vscodeLogger, vscodeTelemetry);
  const dotnet = await vscodeDepsChecker.getDepsStatus(DepsType.Dotnet);
  try {
    await installExtension(backendRoot, dotnet.command, vscodeLogger);
  } catch (e) {
    if (e instanceof DepsCheckerError) {
      await vscodeDepsChecker.display(e.message, e.helpLink);
    } else {
      await vscodeDepsChecker.display(Messages.defaultErrorMessage, defaultHelpLink);
    }
    return false;
  }
  return true;
}
