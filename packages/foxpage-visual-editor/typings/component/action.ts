import { Component } from '../common';

export interface ComponentAddParams {
  type: 'insert' | 'append';
  detail: {
    componentId: string;
    pos: string;
    desc: Component;
    parentId: string;
  }
}
