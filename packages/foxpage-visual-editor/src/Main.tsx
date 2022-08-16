import React, { useContext, useEffect, useState } from 'react';

import styled from 'styled-components';

import { Component, RenderStructureNode } from '@/types/index';

import Editor from './editor/Index';
import MockEditor from './mocker/Index';
import Sidebar from './sidebar/Index';
import Viewer from './viewer/Index';
import { DeviceToolbar } from './components';
import { EditorContext, FoxContext } from './context';
import { cacheData, getCache } from './utils';

import './common.css';

const FlexLayout = styled.div`
  display: flex;
  height: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  background-color: #fff;
`;

interface IProps {}

const WIDTH = window.innerWidth > 1920 ? 500 : 300;
const MAX_WIDTH = 550;

const Main = (_props: IProps) => {
  const [editorExpend, setEditorExpend] = useState(false);
  const [sideExpend, setSideExpend] = useState(false);
  const [editorShrink, setEditorShrink] = useState(false);
  const [mockerVisible, setMockerVisible] = useState(false);
  const [viewWidth, setViewWidth] = useState('100%');
  const [zoom, setZoom] = useState(1);
  const [selectNode, setSelectNode] = useState<RenderStructureNode | null>(null);
  const [selectNodeFrom, setSelectNodeFrom] = useState<'viewer' | 'sider' | undefined>();
  const [selectComponent, setSelectComponent] = useState<Component | null>(null);
  const { events, componentMap, selectNode: defaultSelectNode } = useContext(FoxContext);

  useEffect(() => {
    const cached = getCache();
    setSideExpend(!!cached.sideExpend);
  }, []);

  useEffect(() => {
    setSelectNode(defaultSelectNode || null);
  }, [defaultSelectNode]);

  const handleExpend = (value: boolean) => {
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

  const handleSideExpend = (value: boolean) => {
    setSideExpend(value);
    cache('sideExpend', value);
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
    },
  };

  return (
    <EditorContext.Provider value={editorContextValue}>
      <FlexLayout>
        <Panel style={{ flex: sideExpend ? '0 0 338px' : '0 0 38px', borderRight: '1px solid #f2f2f2' }}>
          <Sidebar expend={sideExpend} onExpend={handleSideExpend} />
        </Panel>
        <Panel style={{ flexGrow: 1 }}>
          <DeviceToolbar onZoomChange={setZoom} onDeviceChange={setViewWidth} />
          <Viewer />
        </Panel>
        <Panel style={{ flex: editorExpend ? `0 0 ${editorShrink ? MAX_WIDTH : WIDTH}px` : '0 0 0px' }}>
          <Editor
            selectNode={selectNode}
            visible={!mockerVisible}
            onShrink={setEditorShrink}
            onExpend={handleExpend}
          />
          <MockEditor selectNode={selectNode} visible={mockerVisible} visibleChange={setMockerVisible} />
        </Panel>
      </FlexLayout>
    </EditorContext.Provider>
  );
};

export default Main;
