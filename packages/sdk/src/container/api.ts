// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from "./container";
import { ComponentMetadata } from "./metadata";

export const _container = new Container();

export function _registerComponent<T>(componentMetadata: ComponentMetadata<T>) {
  _container.register(componentMetadata);
}

export function _initializeComponent(
  componentName: string,
  options: Record<string, unknown>,
  identifier = "default"
) {
  _container.initialize(componentName, options, identifier);
}

export async function _initializeComponentAsync(
  componentName: string,
  options: Record<string, unknown>,
  identifier = "default"
) {
  await _container.initializeAsync(componentName, options, identifier);
}

export function _resolveComponent(componentName: string) {
  return _container.resolve(componentName);
}
