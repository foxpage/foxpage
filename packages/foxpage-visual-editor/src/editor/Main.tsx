import React, { useContext, useEffect, useMemo, useState } from 'react';

import { CaretRightOutlined, FileTextOutlined, FormOutlined } from '@ant-design/icons';
import { Button, Checkbox, Collapse as AntdCollapse, Modal, Radio, Tabs as AntdTabs } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';
import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { JSONEditor } from '@/components/index';
import { FoxContext } from '@/context/index';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import Basic from './Basic';
import EventListener from './EventListener';
import RootNodeEditor from './RootNode';
import Style from './style';
import { getCoveredState, getState } from './utils';

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

const MockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 8px 16px;
`;

interface IProps {
  selectNode: RenderStructureNode | null;
  onChange: (value: RenderStructureNode) => void;
  onWindowChange: FoxBuilderEvents['onWindowChange'];
  type?: string;
}

let cached = {
  editorChanged: false,
  newNode: {} as RenderStructureNode,
  initd: false,
};

function initThrottle(fn: (...args: any) => any) {
  return _.throttle(fn, 300, { trailing: true });
}

let throttleUpdate = (..._args: any) => {};

const EditorMain = (props: IProps) => {
  const [newSelectNode, setNewSelectNode] = useState<RenderStructureNode | null>(null);
  const [tabKey, setTabKey] = useState('props');

  const [editorType, setEditorType] = useState(EditorTypeEnum.form);
  const { foxI18n, loadedComponents, componentMap, rootNode } = useContext(FoxContext);
  const { selectNode, type, onChange, onWindowChange } = props;
  const { props: nodeProps = {}, __styleNode, __editorConfig } = newSelectNode || {};
  const isRootNode = rootNode?.id === selectNode?.id;

  // get EDITOR
  const Editor: FoxpageComponentType | undefined = useMemo(() => {
    if (selectNode?.id) {
      const component = componentMap[selectNode.name];
      const editorEntry = component?.resource?.['editor-entry'];
      const editor = editorEntry && editorEntry.length > 0 ? editorEntry[0] : undefined;
      if (editor) {
        return loadedComponents?.[editor.name];
      }
    }
    return undefined;
  }, [selectNode?.name, loadedComponents, componentMap]);

  const deleteButtonDisabled = useMemo(() => {
    return !newSelectNode || Object.keys(newSelectNode.props).length === 0;
  }, [newSelectNode]);

  useEffect(() => {
    throttleUpdate = initThrottle(handlePropsUpdate);
    cached.editorChanged = false;
    cached.newNode = {} as RenderStructureNode;
  }, []);

  useEffect(() => {
    let newData = _.cloneDeep(selectNode);
    if (newData && cached.newNode && cached.newNode.id === newData.id) {
      if (cached.editorChanged) {
        newData = getState(newData, cached.newNode);
      } else {
        newData = getCoveredState(newData, cached.newNode);
      }
    }
    setNewSelectNode(newData);
    cached.newNode = newData as RenderStructureNode;
  }, [selectNode]);

  const handleUpdateComponent = (opt?: { _data: any; autoSave?: boolean }) => {
    if (cached.newNode || opt?.autoSave) {
      onChange(opt?._data || cached.newNode);
    }
    cached.editorChanged = false;
  };

  const handleUpdate = (key: string, val: any, autoSave?: boolean) => {
    const component = Object.assign({}, cached.newNode, { [key]: val });
    cached.newNode = component;
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
      setNewSelectNode(_component);
      throttleUpdate(_component);
    }
  };

  const handlePropsChange = (props) => {
    const component = _.cloneDeep(cached.newNode);

    if (component) {
      const _component = Object.assign({}, cached.newNode, { props: props });
      cached.newNode = _component;
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

      // handleUpdate('directive', component.directive);
      cached.newNode = component;
      setNewSelectNode(component);
      handleUpdateComponent({ _data: component, autoSave: true });
    }
  };

  const handleDeleteComponentMock = () => {
    Modal.confirm({
      title: foxI18n.delete,
      content: foxI18n.deleteMockTips,
      onOk: () => {
        if (typeof onWindowChange === 'function' && cached.newNode) {
          onWindowChange('mockDelete', {
            id: cached.newNode.id,
          });

          handlePropsChange({});
        }
      },
      okText: foxI18n.yes,
      cancelText: foxI18n.no,
    });
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
      if (cached.initd) {
        // TODO: add throttle on change, will remove blur listener
        handleUpdateComponent();
      }
    },
    onBindVariable: (keys: string, opt: {}) => {
      cached.editorChanged = true;
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

          {__styleNode && __styleNode.id && (
            <Panel header={foxI18n.style} key="style">
              <Style
                key={__styleNode.id}
                {...(__styleNode.props?.style || {})}
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
              // @ts-ignore
              <Editor {...editorParams} />
            ) : (
              <JSONEditor jsonData={nodeProps} onChangeJSON={handlePropsChange} options={{ mode: 'code' }} />
            )}
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
