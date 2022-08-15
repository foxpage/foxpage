import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { Component } from '../common';

export type LoadedComponent = FoxpageComponentType;
export type LoadedComponents = Record<string, LoadedComponent>;

export type ComponentMap = Record<string, Component>; // string: name@version or name
