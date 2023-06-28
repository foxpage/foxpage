import { Component } from '@foxpage/foxpage-client-types';

export interface ComponentAddParams {
  type: 'insert' | 'append';
  detail: {
    componentId: string;
    pos: string;
    desc: Component;
    parentId: string;
  };
}
