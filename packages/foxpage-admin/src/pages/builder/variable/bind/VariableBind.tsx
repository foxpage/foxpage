import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Modal as AntdModal, Spin } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { saveComponentEditorValue, updateEditorValue } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/variable';
import { EditorInputEnum } from '@/constants/variable';
import { Title } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';
import { ComponentPropsType, ComponentStructure, VariableBindRefType } from '@/types/builder';

import BindContext from './BindContext';
import HtmlBind from './HtmlBind';
import JsonBind from './JsonBind';
import TextBind from './TextBind';

const Modal = styled(AntdModal)`
  height: 60%;
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 110px);
      overflow-y: auto;
    }
  }
`;

const Content = styled.div`
  display: flex;
  height: 100%;
  > div > div + div {
    height: calc(100% - 22px);
  }
`;

const VariableContent = styled.div`
  flex: 1;
  margin-right: 12px;
  .variable-list {
    border: 1px solid #1f38584d;
    overflow-y: auto;
    > ul {
      list-style: none;
      line-height: 36px;
      padding: 0;
      > li {
        padding: 0 18px;
        cursor: pointer;
        &:hover {
          background: #1f38580a;
        }
      }
    }
  }
`;

const BindContent = styled.div`
  flex: 2;
  .variable-bind-content {
    > textarea {
      transition: all 0.3s;
      border-radius: 2px;
      &:focus-visible {
        outline: 0;
        border-color: #40a9ff;
        box-shadow: 0 0 0 1px #40a9ff;
      }
    }
  }
`;

const getFinalProps = (selectedComponent: ComponentStructure, keys: string) => {
  const componentProps = _.cloneDeep(selectedComponent.props) || {};
  const keyPath: string[] = keys.split('.') || [];
  const key = keyPath.pop() as string;
  const finalProps = keyPath.reduce((a, c) => {
    if (typeof a[c] !== 'undefined') return a[c];
    a[c] = {};
    return a[c];
  }, componentProps);
  return { key, finalProps, componentProps };
};

const mapStateToProps = (state: RootState) => ({
  variableBindParams: state.builder.variable.variableBindParams,
  variables: state.builder.variable.variables,
  loading: state.builder.variable.loading,
  folderId: state.builder.page.folderId,
  applicationId: state.builder.page.applicationId,
  selectedComponent: state.builder.template.selectedComponent,
});

const mapDispatchToProps = {
  setVariableBindModalVisibleStatus: ACTIONS.setVariableBindModalVisibleStatus,
  getVariables: ACTIONS.getVariables,
  clearAll: ACTIONS.clearAll,
  updateEditorValue: updateEditorValue,
  save: saveComponentEditorValue,
};

type VariableBindProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const VariableBind: React.FC<VariableBindProps> = props => {
  const {
    loading,
    variableBindParams,
    folderId,
    applicationId,
    variables,
    selectedComponent,
    getVariables,
    clearAll,
    setVariableBindModalVisibleStatus,
    updateEditorValue,
    save,
  } = props;
  const { open, keys = '', type } = variableBindParams;
  const variableBindRef = useRef<VariableBindRefType>(null);
  const [value, setValue] = useState<string | ComponentPropsType>('');
  const { locale } = useContext(GlobalContext);
  const { global, variable } = locale.business;

  useEffect(() => {
    if (open) {
      getVariables(folderId);
      const { finalProps, key } = getFinalProps(selectedComponent, keys);
      setValue(finalProps[key] as string);
    } else {
      clearAll();
    }
  }, [open]);

  const handleClick = (str: string) => {
    variableBindRef.current?.replaceProps(str);
  };

  const handleClose = () => {
    setVariableBindModalVisibleStatus({ open: false, keys: '', type: EditorInputEnum.Text });
  };

  const handleSave = () => {
    const { finalProps, key, componentProps } = getFinalProps(selectedComponent, keys);
    if (value === undefined) {
      delete finalProps[key];
    } else {
      finalProps[key] = value;
    }

    updateEditorValue('props', componentProps);
    save(applicationId, false, folderId);
    handleClose();
  };

  const editorContentByType = useMemo(() => {
    switch (type) {
      case EditorInputEnum.HtmlString:
        return <HtmlBind ref={variableBindRef} />;
      case EditorInputEnum.Object:
        return <JsonBind ref={variableBindRef} />;
      default:
        return <TextBind ref={variableBindRef} />;
    }
  }, [type, value]);

  return (
    <Modal
      width="60%"
      title="Variable Bind"
      destroyOnClose
      maskClosable={false}
      visible={open}
      onCancel={handleClose}
      onOk={handleSave}
    >
      <Content>
        <VariableContent>
          <Title>{global.variables}</Title>
          <div className="variable-list">
            {loading && <Spin spinning={true} />}
            <ul>
              {variables?.map(variable => {
                return (
                  <li
                    onClick={() => {
                      handleClick(`{{${variable.name}}}`);
                    }}
                  >
                    {variable.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </VariableContent>
        <BindContent>
          <Title>{variable.content}</Title>
          <div className="variable-bind-content">
            <BindContext.Provider value={{ value, setValue }}>{editorContentByType}</BindContext.Provider>

            <div style={{ height: '50%' }}>
              <Title>{variable.useVariableTitle}</Title>
              <ul style={{ paddingLeft: 16 }}>
                <li>
                  {variable.useVariableTip}
                  {'"{{variableA}}"'})
                </li>
                <li>
                  {variable.useVariableAttrTip}
                  {'"{{variableB:name}}"'})
                </li>
              </ul>
            </div>
          </div>
        </BindContent>
      </Content>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VariableBind);
