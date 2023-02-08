import React, { useContext, useEffect, useState } from 'react';

import isNil from 'lodash/isNil';
import styled from 'styled-components';

import { Component, RenderStructureNode } from '@/types/index';

import Editor from './editor/Index';
import MockEditor from './mocker/Index';
import Sidebar from './sidebar/Index';
import Viewer from './viewer/Index';
import { DeviceToolbar } from './components';
import { EditorContext, FoxContext } from './context';
import { cacheData, getCache } from './utils';

import './common.less';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  background-color: #fff;
`;

interface IProps {}

const WIDTH = window.innerWidth > 1920 ? 400 : 300;
const MAX_WIDTH = 550;

const Main = (_props: IProps) => {
  const [editorExpend, setEditorExpend] = useState(false);
  const [structurePinned, setStructurePinned] = useState(false);
  const [editorShrink, setEditorShrink] = useState(false);
  const [mockerVisible, setMockerVisible] = useState(false);
  const [viewWidth, setViewWidth] = useState('100%');
  const [zoom, setZoom] = useState(1);
  const [selectNode, setSelectNode] = useState<RenderStructureNode | null>(null);
  const [selectNodeFrom, setSelectNodeFrom] = useState<'viewer' | 'sider' | undefined>();
  const [selectComponent, setSelectComponent] = useState<Component | null>(null);
  const {
    events,
    componentMap,
    selectNode: defaultSelectNode,
    pageStructure: structure,
    config,
  } = useContext(FoxContext);

  useEffect(() => {
    const cached = getCache();
    !isNil(cached.sideExpand) && setStructurePinned(cached.sideExpand);
    cached.zoom && setZoom(cached.zoom);
    cached.viewWidth && setViewWidth(cached.viewWidth);
  }, []);

  useEffect(() => {
    setSelectNode(defaultSelectNode || null);
    if (!defaultSelectNode) {
      setEditorExpend(false);
    }
  }, [defaultSelectNode, structure]);

  // close mock editor when mock mode disable outside
  useEffect(() => {
    if (!config?.sys?.mockable) setMockerVisible(false);
  }, [config?.sys?.mockable]);

  const handleCacheOperation = (target, operation) => {
    operation(target.value);
    cache(target.key, target.value);
  };

  const handleExpand = (value: boolean) => {
    if (value !== editorExpend) {
      setEditorExpend(value);
    }
    if (!value) {
      setSelectNode(null);
    }
  };

  const handleSelect = (node: RenderStructureNode | null, opt?: { from: 'viewer' | 'sider' }) => {
    setSelectNode(node);
    setSelectNodeFrom(opt?.from);
    if (node) {
      const component = componentMap[node?.name];
      setSelectComponent(component);
    }
    if (typeof events.onSelectComponent === 'function') {
      events.onSelectComponent(node);
    }
  };

  const handleMockerVisible = (value: boolean) => {
    setMockerVisible(value);
  };

  const cache = (key: string, value: any) => {
    const cached = getCache();
    cached[key] = value;
    cacheData(cached);
  };

  const editorContextValue = {
    zoom,
    viewWidth,
    selectNode,
    selectComponent,
    selectNodeFrom,
    events: {
      openMock: handleMockerVisible,
      selectComponent: handleSelect,
      setSelectNodeFrom: setSelectNodeFrom,
    },
  };

  return (
    <EditorContext.Provider value={editorContextValue}>
      <div className="flex h-full">
        <Panel style={{ borderRight: '1px solid #f2f2f2' }}>
          <Sidebar
            structurePinned={structurePinned}
            onStructurePinned={(value: boolean) =>
              handleCacheOperation({ key: 'sideExpand', value }, setStructurePinned)
            }
          />
        </Panel>
        <Panel style={{ flexGrow: 1 }}>
          <DeviceToolbar
            onZoomChange={(value: number) => handleCacheOperation({ key: 'zoom', value }, setZoom)}
            onDeviceChange={(value: string) =>
              handleCacheOperation({ key: 'viewWidth', value }, setViewWidth)
            }
          />
          <Viewer />
        </Panel>
        <Panel
          style={{
            flex: editorExpend ? `0 0 ${editorShrink ? MAX_WIDTH : WIDTH}px` : '0 0 0px',
            overflow: 'hidden',
          }}>
          <Editor
            selectNode={selectNode}
            visible={!mockerVisible}
            onShrink={setEditorShrink}
            onExpand={handleExpand}
          />
          <MockEditor selectNode={selectNode} visible={mockerVisible} visibleChange={setMockerVisible} />
        </Panel>
      </div>
    </EditorContext.Provider>
  );
};

export default Main;
