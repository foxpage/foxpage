import React, { createElement, useEffect, useMemo, useState } from 'react';

import { CaretRightOutlined, FileTextOutlined, FormOutlined } from '@ant-design/icons';
import { usePrevious } from 'ahooks';
import { Button, Checkbox, Collapse as AntdCollapse, Modal, Radio, Tabs as AntdTabs } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';
import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import { JSONEditor } from '../components';
import { BLANK_NODE } from '../constant';
import { useFoxpageContext } from '../context';

import Basic from './Basic';
import { ConditionBind } from './condition-bind';
import WithErrorCatch from './ErrorCatch';
import EventListener from './EventListener';
import RootNodeEditor from './RootNode';
import { getCoveredState } from './utils';

const { Panel } = AntdCollapse;
const { TabPane } = AntdTabs;

enum TypeEnum {
  'props' = 'props',
  'mock' = 'mock',
}

enum EditorTypeEnum {
  'form' = 'form',
  'json' = 'json',
}

const Collapse = styled(AntdCollapse)`
  .ant-collapse-content-box {
    padding: 0 !important;
  }

  .ant-collapse-item {
    overflow-x: hidden;
    > .ant-collapse-header {
      padding: 8px;
      font-weight: 500;
    }
  }
`;

const Tabs = styled(AntdTabs)`
  .ant-tabs-content-holder {
    min-height: 0;
    overflow: auto;
  }
  .ant-tabs-tab {
    padding: 8px 0;
    margin: 0 0 0 8px !important;
  }
  .ant-collapse-borderless {
    background: #ffffff;
  }
`;

const TabHeader = styled.div`
  width: 60px;
  text-align: center;
`;

const MockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 8px 12px;
`;

interface IProps {
  selectNode?: RenderStructureNode;
  children?: React.ReactNode;
  onChange: (value: RenderStructureNode) => void;
  onWindowChange: FoxBuilderEvents['onWindowChange'];
  type?: string;
}

let changed = false;
let snapshot = '';
let newSnapshot = '';

const EditorMain = (props: IProps) => {
  const [newNode, setNewNode] = useState<RenderStructureNode | null>(null);
  const [tabKey, setTabKey] = useState('props');
  const [editorType, setEditorType] = useState(EditorTypeEnum.form);
  const [keyId, setKeyId] = useState(0);
  const { foxI18n, loadedComponents, componentMap, rootNode, pageNode } = useFoxpageContext();
  const { selectNode, type, onChange, onWindowChange } = props;
  const { id: selectNodeId = '', name: selectNodeName = '' } = selectNode || {};
  const { props: nodeProps = {}, __editorConfig } = newNode || {};
  const isRootNode = rootNode?.id === selectNodeId;
  const isNode = !!selectNode?.extension || selectNode?.label || selectNode?.type || selectNode?.version;

  // get EDITOR
  const Editor: FoxpageComponentType | undefined = useMemo(() => {
    if (selectNodeId) {
      const component = componentMap[selectNodeName];
      const editorEntry = component?.resource?.['editor-entry'];
      const editor = editorEntry && editorEntry.length > 0 ? editorEntry[0] : undefined;
      if (editor) {
        return loadedComponents?.[editor.name];
      }
    }
    return undefined;
  }, [selectNodeName, loadedComponents, componentMap]);

  const deleteButtonDisabled = useMemo(() => {
    return !newNode || Object.keys(newNode.props).length === 0;
  }, [newNode]);

  const prevSelectNodeId = usePrevious(selectNode?.id);
  useEffect(() => {
    if (selectNode?.id !== prevSelectNodeId) {
      changed = false;
      snapshot = '';
      newSnapshot = '';
    }
    // update newNode by selectNode
    // because of some props will be modified on outside platform
    let __newNode: RenderStructureNode | null;
    try {
      __newNode = JSON.parse(newSnapshot);
    } catch (e) {
      __newNode = null;
    }
    const _changedFromOutSide = (selectNode?.__lastModified || 0) > (__newNode?.__lastModified || 0);
    if (_changedFromOutSide) {
      setKeyId(new Date().getTime());
    }
    const _newNode = selectNode
      ? {
          ...(__newNode && selectNodeId === __newNode.id && isNode
            ? getCoveredState(cloneDeep(selectNode), __newNode)
            : selectNode),
          children: [],
        }
      : null;
    setNewNode(_newNode);
    // reset changed status
    if (selectNodeId !== __newNode?.id) {
      changed = false;
    }
    snapshot = _newNode ? JSON.stringify(_newNode) : '';
  }, [selectNode, prevSelectNodeId]);

  useEffect(() => {
    return () => {
      changed = false;
      snapshot = '';
      newSnapshot = '';
    };
  }, []);

  if (!isRootNode && isNode && !__editorConfig?.editable) {
    return null;
  }

  const variableBind = (keys: string, opt: {}) => {
    if (typeof onWindowChange === 'function' && newNode) {
      onWindowChange('variableBind', {
        status: true,
        component: newNode,
        keys,
        opt,
      });
    }
  };

  const editorParams: any = {
    componentProps: nodeProps || {},
    widgets: { ...widgets, Listeners: () => '' },
    propChange: handlePropChange,
    applyState: () => {
      handleBlurToChange();
    },
    // no used
    propsChange: () => {},
    onBindVariable: variableBind,
    onBindValue: variableBind,
  };

  const EditorElem = Editor ? createElement(Editor as any, { ...editorParams }, null) : null;

  const WithErrorCatchElem = (
    // @ts-ignore
    <WithErrorCatch key={keyId} editor={EditorElem} tips={foxI18n.editorRenderError} />
  );

  if (isRootNode && rootNode) {
    let _rootNode = rootNode;
    if (rootNode.id === selectNodeId) {
      _rootNode = {
        ...rootNode,
        props: selectNode?.props || rootNode.props,
        directive: selectNode?.directive || pageNode?.directive,
      };
    }
    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <EditContext.Provider key={newNode?.id} value={editorParams as any}>
          {WithErrorCatchElem}
        </EditContext.Provider>
        <RootNodeEditor node={_rootNode} />
      </div>
    );
  }

  return (
    <Tabs
      centered
      className="text-sm h-full"
      activeKey={tabKey}
      defaultActiveKey="props"
      onChange={setTabKey}
      destroyInactiveTabPane
      size={'small'}
      tabBarStyle={{ marginBottom: 0, marginLeft: 4 }}
      onBlurCapture={handleBlurToChange}>
      {type !== TypeEnum.mock && (
        <TabPane tab={<TabHeader>{foxI18n.basic}</TabHeader>} key="basic">
          <Collapse
            bordered={false}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            defaultActiveKey={['basic', 'style']}>
            <Panel header={foxI18n.basic} key="basic">
              {newNode && <Basic node={newNode} onChange={handleUpdate} onApplyState={handleBlurToChange} />}
            </Panel>
            {newNode && newNode.name === '@fox-design/react-slot' && (
              <Panel header={foxI18n.directive} key="directive">
                <div style={{ padding: 12 }}>
                  <Checkbox
                    checked={!!newNode.directive?.tpl}
                    onChange={(e) => {
                      handleDirectiveChange(e.target.checked ? '{{$this:children}}' : undefined);
                    }}>
                    tpl:this.children
                  </Checkbox>
                </div>
              </Panel>
            )}
          </Collapse>
        </TabPane>
      )}
      <TabPane tab={<TabHeader>{foxI18n.props}</TabHeader>} key="props">
        {Editor ? (
          <EditContext.Provider key={newNode?.id} value={editorParams as any}>
            {type === TypeEnum.mock && (
              <MockHeader>
                <Radio.Group
                  size="small"
                  buttonStyle="solid"
                  value={editorType}
                  onChange={(e) => setEditorType(e.target.value)}>
                  <Radio.Button value={EditorTypeEnum.form}>
                    <FormOutlined />
                  </Radio.Button>
                  <Radio.Button value={EditorTypeEnum.json}>
                    <FileTextOutlined />
                  </Radio.Button>
                </Radio.Group>
                <div>
                  <Checkbox defaultChecked onChange={(e) => handlePropChange('__enable', e.target.checked)}>
                    <span style={{ userSelect: 'none' }}>{foxI18n.enable}</span>
                  </Checkbox>
                  <Button
                    danger
                    type="ghost"
                    size="small"
                    disabled={deleteButtonDisabled}
                    onClick={handleDeleteComponentMock}
                    style={{ marginLeft: 8 }}>
                    {foxI18n.delete}
                  </Button>
                </div>
              </MockHeader>
            )}
            {editorType === EditorTypeEnum.form ? (
              WithErrorCatchElem
            ) : (
              <JSONEditor jsonData={nodeProps} onChangeJSON={handlePropsChange} options={{ mode: 'code' }} />
            )}
          </EditContext.Provider>
        ) : (
          <div style={{ padding: '12px 16px' }}>{foxI18n.noEditor}</div>
        )}
      </TabPane>
      {newNode && type !== TypeEnum.mock && newNode.name !== BLANK_NODE && (
        <TabPane tab={<TabHeader>{foxI18n.condition}</TabHeader>} key="condition">
          {tabKey === 'condition' && <ConditionBind />}
        </TabPane>
      )}
      <TabPane tab={<TabHeader>{foxI18n.listener}</TabHeader>} key="listener">
        {newNode && <EventListener component={newNode} updateEditorValue={handleUpdate} />}
      </TabPane>
    </Tabs>
  );

  function updateNewNode(_newNode: RenderStructureNode | null) {
    // update snapshot
    newSnapshot = _newNode ? JSON.stringify(_newNode) : '';
    changed = true;

    // for cover old or be cover by old
    if (_newNode) {
      Object.assign(_newNode, { __lastModified: new Date().getTime() });
    }

    setNewNode(_newNode);
  }

  function handleUpdate(key: string, val: any, autoSave?: boolean) {
    const component = Object.assign({}, newNode, { [key]: val });
    updateNewNode(component);
    if (autoSave) {
      handleBlurToChange();
    }
  }

  function handlePropChange(keys, val) {
    if (!newNode) {
      return;
    }

    const keyPath = keys.split('.');
    const key = keyPath.pop() as string;
    const component = cloneDeep(newNode);
    const originProps = component.props || {};
    const props = keyPath.reduce((a, c) => {
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, originProps);
    if (val === undefined) {
      delete props[key];
    } else {
      props[key] = val;
    }

    updateNewNode(Object.assign({}, component, { props: component.props }));
  }

  function handlePropsChange(props) {
    if (!newNode) {
      return;
    }
    const component = cloneDeep(newNode || {});
    updateNewNode(Object.assign({}, component, { props: props }));
  }

  function handleDirectiveChange(tpl?: string) {
    if (newNode) {
      const component = cloneDeep(newNode);
      if (component.directive) {
        component.directive.tpl = tpl;
      } else {
        component.directive = { tpl };
      }
      updateNewNode(component);
      handleBlurToChange();
    }
  }

  function handleDeleteComponentMock() {
    Modal.confirm({
      title: foxI18n.delete,
      content: foxI18n.deleteMockTips,
      onOk: () => {
        if (typeof onWindowChange === 'function' && newNode) {
          onWindowChange('mockDelete', {
            id: selectNodeId,
          });

          handlePropsChange({});
        }
      },
      okText: foxI18n.yes,
      cancelText: foxI18n.no,
    });
  }

  /**
   * for fixed modified not affect
   */
  function handleBlurToChange() {
    if (changed && newSnapshot !== snapshot) {
      onChange(JSON.parse(newSnapshot));
      snapshot = newSnapshot;
      changed = false;
    }
  }
};

export default EditorMain;
