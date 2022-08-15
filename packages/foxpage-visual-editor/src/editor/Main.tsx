import React, { useContext, useEffect, useState } from 'react';

import { CaretRightOutlined } from '@ant-design/icons';
import { Checkbox, Collapse as AntdCollapse, Tabs as AntdTabs } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';
import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { FoxContext } from '@/context/index';
import { RenderStructureNode } from '@/types/index';

import Basic from './Basic';
import EventListener from './EventListener';
import RootNodeEditor from './RootNode';
import Style from './style';

const { Panel } = AntdCollapse;
const { TabPane } = AntdTabs;

const Collapse = styled(AntdCollapse)`
  .ant-collapse-content-box {
    background: #fafafa !important;
    padding: 0 !important;
  }

  .ant-collapse-item {
    overflow-x: hidden;
    > .ant-collapse-header {
      padding: 8px;
    }
  }
`;

const Tabs = styled(AntdTabs)`
  height: 100%;
  .ant-tabs-content-holder {
    height: calc(100% - 46px);
    overflow: auto;
  }
  .ant-tabs-tab {
    font-size: 12px;
  }
`;

const TabHeader = styled.div`
  width: 60px;
  text-align: center;
`;

interface IProps {
  selectNode: RenderStructureNode | null;
}

let cached = {
  editorChanged: false,
  newNode: {} as RenderStructureNode,
};

function initThrottle(fn: (...args: any) => any) {
  return _.throttle(fn, 300);
}
let throttleUpdate = (..._args: any) => {};

const EditorMain = (props: IProps) => {
  const [newSelectNode, setNewSelectNode] = useState<RenderStructureNode | null>(null);
  const [tabKey, setTabKey] = useState('props');
  const { foxI18n, loadedComponents, componentMap, events, rootNode } = useContext(FoxContext);
  const { onUpdateComponent, onWindowChange } = events;
  const { selectNode } = props;
  const { props: nodeProps = {}, __styleNode, __editorConfig } = newSelectNode || {};
  const isRootNode = rootNode?.id === selectNode?.id;

  // get EDITOR
  let Editor: FoxpageComponentType | undefined = undefined;
  if (selectNode?.id) {
    const component = componentMap[selectNode.name];
    const editorEntry = component?.resource?.['editor-entry'];
    const editor = editorEntry && editorEntry.length > 0 ? editorEntry[0] : undefined;
    if (editor) {
      Editor = loadedComponents?.[editor.name];
    }
  }

  useEffect(() => {
    throttleUpdate = initThrottle(handlePropsUpdate);
  }, []);

  useEffect(() => {
    let newData = _.cloneDeep(selectNode);
    if (newData && cached.newNode && cached.newNode.id === newData.id) {
      newData = {
        ...newData,
        ...cached.newNode,
      };
    }
    cached.newNode = newData as RenderStructureNode;
    cached.editorChanged = false;
    setNewSelectNode(newData);
  }, [selectNode]);

  const handleUpdateComponent = (opt?: { _data: any; autoSave?: boolean }) => {
    if (typeof onUpdateComponent === 'function' && (cached.newNode || opt?.autoSave)) {
      onUpdateComponent(opt?._data || cached.newNode);
    }
    cached.editorChanged = false;
  };

  const handleUpdate = (key: string, val: any, autoSave?: boolean) => {
    const component = Object.assign({}, cached.newNode, { [key]: val });
    cached.newNode = component;
    cached.editorChanged = true;
    setNewSelectNode(component);
    if (autoSave) {
      handleUpdateComponent({ _data: component, autoSave: true });
    }
  };

  const handlePropsUpdate = (component: RenderStructureNode) => {
    handleUpdateComponent({ _data: component, autoSave: true });
  };

  const handlePropChange = (keys, val) => {
    const keypath = keys.split('.');
    const key = keypath.pop() as string;

    const component = _.cloneDeep(cached.newNode);
    const originProps = component?.props || {};

    const props = keypath.reduce((a, c) => {
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, originProps);

    if (val === undefined) {
      delete props[key];
    } else {
      props[key] = val;
    }

    if (component) {
      const _component = Object.assign({}, cached.newNode, { props: component.props });
      cached.newNode = _component;
      cached.editorChanged = true;
      setNewSelectNode(_component);
      throttleUpdate(_component);
    }
  };

  const handleUpdateStyle = (opt?: { _data: any; autoSave?: boolean }) => {
    handleUpdateComponent({ _data: opt?._data || __styleNode, autoSave: opt?.autoSave });
  };

  const handleStyleChange = (key: string, value: string, autoSave?: boolean) => {
    const component = _.cloneDeep(__styleNode);
    if (component) {
      if (!component.props) {
        component.props = {};
      }
      if (!component.props.style) {
        component.props.style = {};
      }
      component.props.style[key] = value;
      handleUpdate('__styleNode', component);
      if (autoSave) {
        handleUpdateStyle({ _data: component, autoSave: true });
      }
    }
  };

  const handleDirectiveChange = (tpl?: string) => {
    if (newSelectNode) {
      const component = _.cloneDeep(cached.newNode);
      if (component.directive) {
        component.directive.tpl = tpl;
      } else {
        component.directive = { tpl };
      }

      handleUpdate('props', component.directive);
      handleUpdateComponent({ _data: component, autoSave: true });
    }
  };

  if (!isRootNode && !__editorConfig?.editable) {
    return null;
  }

  const editorParams = {
    componentProps: nodeProps || {},
    widgets,
    propChange: handlePropChange,
    propsChange: () => {},
    applyState: () => {
      if (cached.editorChanged) {
        // TODO: add throttle on change, will remove blur listener
        handleUpdateComponent();
      }
    },
    onBindVariable: (keys: string, opt: {}) => {
      if (typeof onWindowChange === 'function' && cached.newNode) {
        onWindowChange('variableBind', {
          status: true,
          component: cached.newNode,
          keys,
          opt,
        });
      }
    },
  };

  if (isRootNode && rootNode) {
    return (
      <>
        {Editor && (
          <EditContext.Provider key={newSelectNode?.id} value={editorParams}>
            {
              // @ts-ignore
              <Editor {...editorParams} />
            }
          </EditContext.Provider>
        )}
        <RootNodeEditor node={rootNode} />
      </>
    );
  }

  return (
    <Tabs centered activeKey={tabKey} onChange={setTabKey} tabBarStyle={{ marginBottom: 0, marginLeft: 4 }}>
      <TabPane tab={<TabHeader>{foxI18n.basic}</TabHeader>} key="basic">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          defaultActiveKey={['basic', 'style']}>
          <Panel header={foxI18n.basic} key="basic">
            {newSelectNode && (
              <Basic
                id={newSelectNode.id}
                name={newSelectNode.name || ''}
                label={newSelectNode.label || ''}
                version={newSelectNode.version || ''}
                onChange={handleUpdate}
                onApplyState={handleUpdateComponent}
              />
            )}
          </Panel>

          {newSelectNode && newSelectNode.name === '@fox-design/react-slot' && (
            <Panel header={foxI18n.directive} key="directive">
              <div style={{ padding: 12 }}>
                <Checkbox
                  checked={!!newSelectNode.directive?.tpl}
                  onChange={(e) => {
                    handleDirectiveChange(e.target.checked ? '{{$this.children}}' : undefined);
                  }}>
                  tpl:this.children
                </Checkbox>
              </div>
            </Panel>
          )}

          {__styleNode && (
            <Panel header={foxI18n.style} key="style">
              <Style
                key={__styleNode?.id}
                {...(__styleNode?.props?.style || {})}
                onChange={handleStyleChange}
                onApplyState={handleUpdateStyle}
              />
            </Panel>
          )}
        </Collapse>
      </TabPane>
      <TabPane tab={<TabHeader>{foxI18n.props}</TabHeader>} key="props">
        {Editor ? (
          <EditContext.Provider key={newSelectNode?.id} value={editorParams}>
            {
              // @ts-ignore
              <Editor {...editorParams} />
            }
          </EditContext.Provider>
        ) : (
          <div style={{ padding: '12px 16px' }}>{foxI18n.noEditor}</div>
        )}
      </TabPane>
      <TabPane tab={<TabHeader>{foxI18n.listener}</TabHeader>} key="listener">
        {newSelectNode && <EventListener component={newSelectNode} updateEditorValue={handleUpdate} />}
      </TabPane>
    </Tabs>
  );
};

export default EditorMain;
