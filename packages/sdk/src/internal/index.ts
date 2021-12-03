// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { registerLogger } from "../util/logger";

export {
  registerComponent,
  initializeComponent,
  initializeComponentAsync,
  resolveComponent,
} from "./api";
export { ComponentContainer, InitializeOptions } from "./types";
export { ComponentMetadata } from "./metadata";
export { Logger } from "../util/logger";

registerLogger();
