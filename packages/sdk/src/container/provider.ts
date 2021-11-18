// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ComponentContainer } from "./types";
import { ComponentMetadata } from "./metadata";

export class ComponentProvider<T> {
  metadata: ComponentMetadata<T>;
  container: ComponentContainer;
  instances: Map<string, T>;

  constructor(metadata: ComponentMetadata<T>, container: ComponentContainer) {
    this.metadata = metadata;
    this.container = container;
    this.instances = new Map<string, T>();
  }

  initialize(identifier: string, options?: Record<string, unknown>): T {
    if (this.instances.get(identifier)) {
      throw new Error("already initialized");
    }
    const instance = this.metadata.componentFactory(this.container, options);
    this.instances.set(identifier, instance);
    return instance;
  }

  resolve(identifier: string): T {
    const instance = this.instances.get(identifier);
    if (instance) {
      return instance;
    }
    // use factory to initialize without parameters
    const newInstance = this.metadata.componentFactory(this.container);
    this.instances.set(identifier, newInstance);
    return newInstance;
  }
}
