import React, { useCallback, useContext, useEffect, useState } from 'react';

import { CaretRightOutlined } from '@ant-design/icons';
import { Checkbox, Collapse as AntdCollapse, Tabs as AntdTabs } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';
import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { ComponentStructure } from '@/types/component';

import viewerContext from '../viewerContext';

import Basic from './Basic';
import EventListener from './EventListener';
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
      padding: 8px 0;
    }
  }
`;

const Tabs = styled(AntdTabs)`
  height: 100%;
  .ant-tabs-content-holder {
    height: calc(100% - 46px);
    overflow: auto;
  }
`;

interface EditorProps {
  selectedComponent?: ComponentStructure;
  selectedWrapperComponent?: ComponentStructure;
  fileType: string;
  loadedComponent: Record<string, FoxpageComponentType>;
  updateEditorValue: (key: string, value: unknown) => void;
  updateWrapperProps: (key: string, value: unknown) => void;
  saveComponent: (isWrapper: boolean) => void;
  setVariableBindModalVisibleStatus: (keys: string, opt: { type; isMock: boolean }) => void;
  mockModeEnable: boolean;
}

const EditorDrawer: React.FC<EditorProps> = (props) => {
  const [newSelectedComponent, setNewSelectedComponent] = useState<ComponentStructure | undefined>();
  const [newSelectedWrapperComponent, setNewSelectedWrapperComponent] = useState<
    ComponentStructure | undefined
  >();
  const [tabKey, setTabKey] = useState('props');

  const { foxpageI18n } = useContext(viewerContext);
  const {
    selectedComponent,
    selectedWrapperComponent,
    fileType,
    loadedComponent,
    mockModeEnable,
    saveComponent,
    updateEditorValue,
    updateWrapperProps,
    setVariableBindModalVisibleStatus,
  } = props;

  useEffect(() => {
    if (selectedComponent) {
      setNewSelectedComponent(_.cloneDeep(selectedComponent));
    }
  }, [selectedComponent]);

  useEffect(() => {
    if (selectedWrapperComponent) {
      setNewSelectedWrapperComponent(_.cloneDeep(selectedWrapperComponent));
    }
  }, [selectedWrapperComponent]);

  useEffect(() => {
    if (!mockModeEnable) setTabKey('props');
  }, [mockModeEnable]);

  let Editor: FoxpageComponentType | undefined = undefined;
  if (selectedComponent?.id) {
    const editorEntry = selectedComponent.resource?.['editor-entry'];
    const editor = editorEntry && editorEntry.length > 0 ? editorEntry[0] : undefined;
    if (editor) {
      Editor = loadedComponent?.[editor.name];
    }
  }

  const handlePropChange = (keys, val, type) => {
    const keypath = keys.split('.');
    const key = keypath.pop() as string;

    // clone component selected
    const component = _.cloneDeep(newSelectedComponent);

    // get origin by different editor type
    const originProps = component?.[type] || {};

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
      updateEditorValue(type, component[type]);
    }

    setNewSelectedComponent(component);
  };

  const handlePropsChange = () => {};

  const handleWrapperPropsChange = (key: string, value: string) => {
    const component = _.cloneDeep(newSelectedWrapperComponent);
    if (component) {
      if (!component.props) {
        component.props = {};
      }
      if (!component.props.style) {
        component.props.style = {};
      }
      component.props.style[key] = value;
      setNewSelectedWrapperComponent(component);
      updateWrapperProps(key, value);
    }
  };

  const handleDirectiveChange = (tpl?: string) => {
    if (newSelectedComponent) {
      const component = _.cloneDeep(newSelectedComponent);
      if (component.directive) {
        component.directive.tpl = tpl;
      } else {
        component.directive = { tpl };
      }

      setNewSelectedComponent(component);
      updateEditorValue('directive', component.directive);
      saveComponent(false);
    }
  };

  const generateEditorParams = useCallback(
    (type) => {
      if (!newSelectedComponent?.belongTemplate) {
        return {
          componentProps: newSelectedComponent?.[type] || {},
          widgets,
          propChange: (keys, value) => handlePropChange(keys, value, type),
          propsChange: handlePropsChange,
          applyState: () => {
            saveComponent(false);
          },
          onBindVariable: (keys: string, opt: { type }) => {
            setVariableBindModalVisibleStatus(keys, { ...opt, isMock: type === 'mock' });
          },
        };
      }
      // template component
      return {
        componentProps: newSelectedComponent?.[type] || {},
        widgets,
        propChange: () => {},
        propsChange: () => {},
        applyState: () => {},
        onBindVariable: () => {},
      };
    },
    [newSelectedComponent],
  );

  const handleComponentBasicChange = (key: string, val: string) => {
    const component = Object.assign({}, newSelectedComponent, { [key]: val });
    setNewSelectedComponent(component);
    updateEditorValue(key, val);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {!newSelectedComponent?.belongTemplate && (
        <Tabs
          centered
          activeKey={tabKey}
          onChange={setTabKey}
          tabBarStyle={{ marginBottom: 0, marginLeft: 4 }}>
          <TabPane tab={foxpageI18n.basic} key="basic">
            <Collapse
              bordered={false}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              defaultActiveKey={['basic', 'style']}>
              <Panel header={foxpageI18n.basic} key="basic">
                {newSelectedComponent && (
                  <Basic
                    id={newSelectedComponent.id}
                    name={newSelectedComponent.name || ''}
                    label={newSelectedComponent.label || ''}
                    version={newSelectedComponent.version || ''}
                    onChange={(key: string, val: string) => {
                      handleComponentBasicChange(key, val);
                    }}
                    onApplyState={() => {
                      saveComponent(false);
                    }}
                  />
                )}
              </Panel>
              {fileType === 'template' && newSelectedComponent && (
                <Panel header={foxpageI18n.directive} key="directive">
                  <div style={{ padding: 12 }}>
                    <Checkbox
                      checked={!!newSelectedComponent.directive?.tpl}
                      onChange={(e) => {
                        handleDirectiveChange(e.target.checked ? '{{$this.children}}' : undefined);
                      }}>
                      tpl:this.children
                    </Checkbox>
                  </div>
                </Panel>
              )}
              {selectedComponent?.wrapper && (
                <Panel header={foxpageI18n.style} key="style">
                  <Style
                    {...(newSelectedWrapperComponent?.props ? newSelectedWrapperComponent.props.style : {})}
                    onChange={handleWrapperPropsChange}
                    onApplyState={() => {
                      saveComponent(true);
                    }}
                  />
                </Panel>
              )}
            </Collapse>
          </TabPane>
          <TabPane tab={foxpageI18n.props} key="props">
            {Editor ? (
              <EditContext.Provider key={newSelectedComponent?.id} value={generateEditorParams('props')}>
                <Editor {...generateEditorParams('props')} />
              </EditContext.Provider>
            ) : (
              <div style={{ padding: '12px 16px' }}>{foxpageI18n.noEditor}</div>
            )}
          </TabPane>
          {mockModeEnable && (
            <TabPane tab={foxpageI18n.mock} key="mock">
              {Editor ? (
                <EditContext.Provider
                  key={`${newSelectedComponent?.id}_mock`}
                  value={generateEditorParams('mock')}>
                  <Editor {...generateEditorParams('mock')} />
                </EditContext.Provider>
              ) : (
                <div style={{ padding: '12px 16px' }}>{foxpageI18n.noEditor}</div>
              )}
            </TabPane>
          )}
          <TabPane tab={foxpageI18n.listener} key="listener">
            <EventListener
              selectedComponent={newSelectedComponent}
              saveComponent={saveComponent}
              updateEditorValue={(key, value) => {
                if (newSelectedComponent) {
                  const component = _.cloneDeep(newSelectedComponent);
                  component[key] = value;
                  setNewSelectedComponent(component);
                  updateEditorValue(key, value);
                }
              }}
            />
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default EditorDrawer;
