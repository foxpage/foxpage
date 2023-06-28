import React, { useEffect, useState } from 'react';

import isNil from 'lodash/isNil';

import { Component, RenderStructureNode } from '@/types/index';

import { EditorContext, useFoxpageContext } from './context';
import { cacheData, getCache } from './utils';

export interface DesignerContextProviderProps {
  children: React.ReactNode;
}

export default function DesignerContextProvider({ children }: DesignerContextProviderProps) {
  const [editorExpand, setEditorExpand] = useState(false);
  const [editorShrink, setEditorShrink] = useState(false);
  const [selectComponent, setSelectComponent] = useState<Component | null>(null);
  const [mockerVisible, setMockerVisible] = useState(false);
  const [structurePinned, setStructurePinned] = useState(false);
  const [selectRect, setSelectRect] = useState<DOMRect>();

  const {
    componentMap,
    config,
    events: { onSelectComponent },
  } = useFoxpageContext();

  useEffect(() => {
    const cached = getCache();
    !isNil(cached.sideExpand) && setStructurePinned(cached.sideExpand);
  }, []);

  // close mock editor when mock mode disable outside
  useEffect(() => {
    if (!config?.sys?.mockable) setMockerVisible(false);
  }, [config?.sys?.mockable]);

  useEffect(() => {
    if (editorExpand) {
      handleEditorExpand(false);
    }
  }, [config.page?.id]);

  return (
    <EditorContext.Provider
      value={{
        selectComponent,
        selectRect,
        mockerVisible,
        structurePinned,
        editorExpand,
        editorShrink,
        events: {
          handleEditorShrink,
          handleMockerVisible,
          handleSelectComponent,
          handleEditorExpand,
          handleStructurePinned,
          handleNodeRectSelect,
        },
      }}>
      {children}
    </EditorContext.Provider>
  );

  function cache(key: string, value: any) {
    const cached = getCache();
    cached[key] = value;
    cacheData(cached);
  }

  function handleNodeRectSelect(rect: DOMRect) {
    setSelectRect(rect);
  }

  function handleSelectComponent(node: RenderStructureNode | null, from: 'viewer' | 'sider') {
    if (node) {
      const component = componentMap[node?.name];
      setSelectComponent(component);
      handleEditorExpand(true);
      onSelectComponent?.(node, { from });
    }
  }

  function handleMockerVisible(value: boolean) {
    setMockerVisible(value);
  }

  function handleEditorExpand(value: boolean) {
    setEditorExpand(value);
    if (!value) {
      onSelectComponent?.(null);
    }
  }

  function handleEditorShrink(value: boolean) {
    setEditorShrink(value);
  }

  function handleCacheOperation(target, operation) {
    operation(target.value);
    cache(target.key, target.value);
  }

  function handleStructurePinned(value: boolean) {
    handleCacheOperation({ key: 'sideExpand', value }, setStructurePinned);
  }
}
