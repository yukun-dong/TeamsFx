// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { registerLogger } from "../util/logger";

export {
  _registerComponent,
  _initializeComponent,
  _initializeComponentAsync,
  _resolveComponent,
} from "./api";
export { ComponentContainer, InitializeOptions } from "./types";
export { ComponentMetadata } from "./metadata";
export { Logger } from "../util/logger";

registerLogger();
