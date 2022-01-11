import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CaretRightOutlined } from '@ant-design/icons';
import { Checkbox, Collapse as AntdCollapse, Tabs as AntdTabs } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';

import * as ACTIONS from '@/actions/builder/template';
import { setVariableBindModalVisibleStatus } from '@/actions/builder/variable';
import { FileTypeEnum } from '@/constants/global';
import { EditorInputEnum } from '@/constants/variable';

import { SYSTEM_PAGE } from '../constant';
import VariableBind from '../variable/bind/VariableBind';

import Basic from './Basic';
import ConditionEditor from './condition';
import EventListener from './listener';
import PageEditor from './PageEditor';
import Style from './style';

const { Panel } = AntdCollapse;
const { TabPane } = AntdTabs;

const Collapse = styled(AntdCollapse)`
  .ant-collapse-content-box {
    background: #fafafa !important;
    padding: 0 !important;
  }
  .ant-collapse-item > .ant-collapse-header {
    padding: 8px 0;
  }
`;

const Tabs = styled(AntdTabs)`
  height: 100%;
  .ant-tabs-content-holder {
    height: calc(100% - 46 px);
    overflow: auto;
  }
`;

const mapStateToProps = (store: RootState) => ({
  selectedComponentId: store.builder.template.selectedComponentId,
  selectedComponent: store.builder.template.selectedComponent,
  selectedWrapperComponent: store.builder.template.selectedWrapperComponent,
  componentEditorOpen: store.builder.template.componentEditorOpen,
  loadedComponent: store.builder.viewer.loadedComponent,
  componentList: store.builder.template.componentList,
  componentEditorValue: store.builder.template.componentEditorValue,
  versionType: store.builder.template.versionType,
});

const mapDispatchToProps = {
  save: ACTIONS.saveComponentEditorValue,
  updateEditorValue: ACTIONS.updateEditorValue,
  updateWrapperValue: ACTIONS.updateWrapperProps,
  setVariableBindModalVisibleStatus: setVariableBindModalVisibleStatus,
};

type EditorDrawerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditorDrawer: React.FC<EditorDrawerProps> = props => {
  const { applicationId, folderId } = useParams<{ applicationId: string; folderId: string }>();
  const {
    selectedComponentId,
    selectedComponent,
    selectedWrapperComponent,
    loadedComponent,
    versionType,
    save,
    updateEditorValue,
    updateWrapperValue,
    setVariableBindModalVisibleStatus,
  } = props;

  let Editor = null;
  if (loadedComponent && selectedComponent?.id) {
    const editor = selectedComponent.resource?.['editor-entry'];
    const editorName = editor && editor.length > 0 ? editor[0]?.name : undefined;
    if (editorName) {
      Editor = loadedComponent[editorName];
    }
  }
  const componentProps = _.cloneDeep(selectedComponent.props) || {};

  const handlePropChange = (keys, val) => {
    const keypath = keys.split('.');
    const key = keypath.pop() as string;
    const props = keypath.reduce((a, c) => {
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, componentProps);
    if (val === undefined) {
      delete props[key];
    } else {
      props[key] = val;
    }

    updateEditorValue('props', componentProps);
  };
  const handlePropsChange = () => {};

  const editorParams = {
    componentProps,
    propChange: handlePropChange,
    propsChange: handlePropsChange,
    widgets,
    applyState: () => {
      save(applicationId, false, folderId);
    },
    onBindVariable: (keys: string, opt: { type: EditorInputEnum }) => {
      setVariableBindModalVisibleStatus({ open: true, type: opt?.type || EditorInputEnum.Text, keys });
    },
  };

  return (
    <div style={{ height: '100%' }}>
      {(!selectedComponentId || selectedComponentId === SYSTEM_PAGE) && versionType === FileTypeEnum.page ? (
        <PageEditor />
      ) : (
        <React.Fragment>
          {selectedComponentId && !selectedComponent.belongTemplate && (
            <Tabs defaultActiveKey="props" centered tabBarStyle={{ marginBottom: 0 }}>
              <TabPane tab="Basic" key="basic">
                <Collapse
                  bordered={false}
                  expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                  defaultActiveKey={['style']}
                >
                  <Panel header="Basic" key="basic">
                    <Basic
                      id={selectedComponent.id}
                      name={selectedComponent.name || ''}
                      label={selectedComponent.label || ''}
                      version={selectedComponent.version || ''}
                      onChange={(key: string, val: string) => {
                        updateEditorValue(key, val);
                      }}
                      onApplyState={(_key: string, _val: string) => {
                        save(applicationId, false, folderId);
                      }}
                    />
                  </Panel>
                  {versionType === 'template' && (
                    <Panel header="Directive" key="directive">
                      <div style={{ padding: 12 }}>
                        <Checkbox
                          checked={!!(selectedComponent.directive && selectedComponent.directive.tpl)}
                          onChange={e => {
                            updateEditorValue('directive', {
                              ...selectedComponent.directive,
                              tpl: e.target.checked ? '{{$this.children}}' : undefined,
                            });
                            save(applicationId, false, folderId);
                          }}
                        >
                          tpl:this.children
                        </Checkbox>
                      </div>
                    </Panel>
                  )}
                  {selectedWrapperComponent.id && (
                    <Panel header="Style" key="style">
                      <Style
                        {...(selectedWrapperComponent.props ? selectedWrapperComponent.props.style : {})}
                        onChange={(key: string, value: string) => {
                          updateWrapperValue(key, value);
                        }}
                        onApplyState={(_key: string, _value: string | number) => {
                          save(applicationId, true, folderId);
                        }}
                      />
                    </Panel>
                  )}
                </Collapse>
              </TabPane>
              <TabPane tab="Props" key="props">
                {Editor ? (
                  <EditContext.Provider key={selectedComponent.id} value={editorParams}>
                    <Editor {...editorParams} />
                  </EditContext.Provider>
                ) : (
                  <div style={{ padding: '12px 16px' }}>No Editor</div>
                )}
              </TabPane>
              <TabPane tab="Listener" key="listener">
                <EventListener />
              </TabPane>
              <TabPane tab="Condition" key="condition">
                <ConditionEditor />
              </TabPane>
            </Tabs>
          )}
          <VariableBind />
        </React.Fragment>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditorDrawer);
