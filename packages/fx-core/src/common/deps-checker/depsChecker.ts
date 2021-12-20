// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface DepsChecker {
  isInstalled(): Promise<boolean>;

  install(): Promise<void>;

  getDepsInfo(): Promise<DepsInfo>;
}

export interface DepsInfo {
  name: string;
  installVersion?: string;
  supportedVersions: string[];
  details: Map<string, string>;
}
