import React, { useContext } from 'react';

import { Component, RenderStructureNode } from '@/types/index';

import { defaultAction } from './constant';

/**
 * editor context
 * for dynamic update frequently
 */
export interface EditorContext {
  // zoom: number;
  // viewWidth: string;
  selectComponent?: Component | null;
  selectRect?: DOMRect;
  mockerVisible: boolean;
  structurePinned: boolean;
  editorExpand: boolean;
  editorShrink: boolean;
  events: {
    handleEditorShrink: (value: boolean) => void;
    handleMockerVisible: (value: boolean) => void;
    handleSelectComponent: (node: RenderStructureNode, from: 'viewer' | 'sider') => void;
    handleEditorExpand: (value: boolean) => void;
    handleStructurePinned: (value: boolean) => void;
    handleNodeRectSelect: (rect: DOMRect) => void;
  };
}

export const EditorContext = React.createContext<EditorContext>({
  // zoom: 1,
  // viewWidth: '100%',
  mockerVisible: false,
  structurePinned: true,
  editorExpand: false,
  editorShrink: true,
  events: {
    handleEditorShrink: defaultAction,
    handleMockerVisible: defaultAction,
    handleSelectComponent: defaultAction,
    handleEditorExpand: defaultAction,
    handleStructurePinned: defaultAction,
    handleNodeRectSelect: defaultAction,
  },
});

export const useEditorContext = () => useContext<EditorContext>(EditorContext);
