import React from 'react';

import { Component, FoxBuilderEvents, RenderStructureNode } from '@/types/index';

/**
 * editor context 
 * for dynamic update frequently
 */
export interface EditorContext {
  zoom: number;
  viewWidth: string;
  selectNode?: RenderStructureNode | null;
  selectNodeFrom?: 'viewer' | 'sider';
  selectComponent?: Component | null;
  events: {
    selectComponent: FoxBuilderEvents['onSelectComponent'];
    openMock?: (status: boolean) => void;
  };
}

const context = React.createContext<EditorContext>({
  zoom: 1,
  viewWidth: '100%',
  events: {
    selectComponent: () => {},
  },
});

export default context;
