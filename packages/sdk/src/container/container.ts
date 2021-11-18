// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ComponentMetadata } from "./metadata";
import { ComponentProvider } from "./provider";
import { ComponentContainer } from "./types";

export class Container implements ComponentContainer {
  registry: Map<string, ComponentProvider<unknown>>;

  constructor() {
    this.registry = new Map<string, ComponentProvider<unknown>>();
  }

  register(componentMetadata: ComponentMetadata<unknown>) {
    const name = componentMetadata.name;
    if (this.registry.get(name)) {
      throw new Error();
    }
    const provider = new ComponentProvider(componentMetadata, this);
    this.registry.set(name, provider);
  }

  initialize(componentName: string, options: Record<string, unknown>, identifier = "default") {
    const provider = this.registry.get(componentName);
    if (!provider) {
      throw new Error();
    }
    provider.initialize(identifier, options);
  }

  resolve(componentName: string, identifier = "default") {
    const provider = this.registry.get(componentName);
    if (!provider) {
      throw new Error();
    }
    return provider.resolve(identifier);
  }
}
