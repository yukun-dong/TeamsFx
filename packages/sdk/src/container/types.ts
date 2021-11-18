// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface ComponentContainer {
  resolve(componentName: string, identifier?: string, options?: Record<string, unknown>): unknown;
}

export type InitializeOptions = Record<string, unknown>;

export type ComponentFactory<T> = (container: ComponentContainer, options?: InitializeOptions) => T;
