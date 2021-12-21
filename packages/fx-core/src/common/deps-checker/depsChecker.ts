// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface DepsChecker {
  isInstalled(): Promise<boolean>;

  install(): Promise<void>;

  command(): Promise<string>;

  getDepsInfo(): Promise<DepsInfo>;
}

export interface DepsInfo {
  name: string;
  isLinuxSupported: boolean;
  installVersion?: string;
  supportedVersions: string[];
  details: Map<string, string>;
}
