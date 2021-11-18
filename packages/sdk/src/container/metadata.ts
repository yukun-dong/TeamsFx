// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ComponentFactory } from "./types";

export class ComponentMetadata<T> {
  name: string;
  componentFactory: ComponentFactory<T>;
  allowMultipleInstance = false;

  constructor(name: string, factory: ComponentFactory<T>, allowMultipleInstance = false) {
    this.name = name;
    this.componentFactory = factory;
    this.allowMultipleInstance = allowMultipleInstance;
  }
}
