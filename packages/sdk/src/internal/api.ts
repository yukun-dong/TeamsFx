// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from "./container";
import { ComponentMetadata } from "./metadata";

const container = new Container();

export function registerComponent<T>(componentMetadata: ComponentMetadata<T>) {
  container.register(componentMetadata);
}

export function initializeComponent(
  componentName: string,
  options: Record<string, unknown>,
  identifier = "default"
) {
  container.initialize(componentName, options, identifier);
}

export async function initializeComponentAsync(
  componentName: string,
  options: Record<string, unknown>,
  identifier = "default"
) {
  await container.initializeAsync(componentName, options, identifier);
}

export function resolveComponent(componentName: string, identifier = "default") {
  return container.resolve(componentName, identifier);
}
