import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { BugFilled } from '@ant-design/icons';
import { message, Modal as AntdModal, Radio as AntRadio, Spin } from 'antd';
import stringify from 'json-stable-stringify';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { variableBind } from '@/actions/builder/events';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { Title } from '@/components/widgets';
import { EditorInputEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ComponentProps } from '@/types/index';

import { BindContext, CodeBind, HtmlBind, QuillHtmlBind, TextBind } from './components';

enum TabEnum {
  project,
  application,
}

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const Modal = styled(AntdModal)`
  height: 80%;
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 110px);
    }
  }
`;

const Content = styled.div`
  display: flex;
  height: 100%;
`;

const VariableContent = styled.div`
  flex: 0 0 200px;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
  .variable-list {
    border: 1px solid #1f38584d;
    overflow-y: auto;
    flex: 1;
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  .variable-bind-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    .variable-bind-editor {
      flex: 1;
      min-height: 0;
    }
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

const Name = styled(Title)`
  font-size: 15px;
  margin-bottom: 4px;
`;

const Radio = styled(AntRadio.Group)`
  .ant-radio-button-wrapper {
    span {
      font-size: 12px;
    }
  }
`;

const mapStateToProps = (state: RootState) => ({
  variables: state.applications.detail.file.variables.list,
  loading: state.applications.detail.file.variables.loading,
  applicationId: state.builder.header.applicationId,
  folderId: state.builder.header.folderId,
  mock: state.builder.main.mock,
  data: state.builder.main.toolbarModalData,
  type: state.builder.main.toolbarModalType,
  visible: state.builder.main.toolbarModalVisible,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchVariableList: ACTIONS.fetchList,
  closeModal: PAGE_ACTIONS.updateToolbarModalVisible,
  variableBind,
};

type VariableBindProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const VariableBind: React.FC<VariableBindProps> = (props) => {
  const {
    loading,
    folderId,
    applicationId,
    data,
    mock,
    type,
    variables,
    visible,
    clearAll,
    closeModal,
    fetchVariableList,
    variableBind,
  } = props;
  const [tab, setTab] = useState(TabEnum.project);
  const [value, setValue] = useState<string | ComponentProps>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const variableBindRef = useRef<any>(null);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, variable, builder } = locale.business;

  const open = useMemo(() => visible && type === 'variableBind', [visible, type]);

  const component = useMemo(() => {
    const { component } = data || {};

    return component;
  }, [data]);

  const { keys, isMock } = useMemo(() => {
    const { keys, isMock } = data || {};

    return { keys, isMock };
  }, [data]);

  useEffect(() => {
    if (open) {
      if (applicationId && folderId) {
        let params: any = {
          applicationId,
          page: PAGE_NUM,
          size: PAGE_SIZE,
        };
        if (tab === TabEnum.project) {
          params = {
            ...params,
            folderId,
          };
        } else {
          params = {
            ...params,
            type: 'live',
          };
        }

        fetchVariableList(params);
      }
    } else {
      clearAll();
    }
  }, [open, applicationId, folderId, tab]);

  useEffect(() => {
    if (open) {
      const componentProps = { ...(component?.props || {}) };
      const keyPath: string[] = keys.split('.') || [];
      const finalProps = keyPath.reduce((a: any, c: string) => {
        if (typeof a[c] !== 'undefined') return a[c];
        a[c] = {};
        return a[c];
      }, componentProps);

      setValue(finalProps);
    }
  }, [open, component]);

  const handleClick = (str: string) => {
    variableBindRef.current?.replaceProps(str);
  };

  const handleCancel = () => {
    closeModal(false);
    setPreviewMode(false);
  };

  const handleOk = () => {
    const [err] = variableBindRef.current?.checker?.() || [];
    if (err) {
      message.error(builder.illegalEditorContentTips);
    } else {
      variableBind(keys, value as string, { isMock });
      handleCancel();
    }
  };

  const ContentEditor = useMemo(() => {
    const type = data?.opt?.type;
    switch (type) {
      case EditorInputEnum.HtmlString:
        return <HtmlBind ref={variableBindRef} />;
      case EditorInputEnum.RichText:
        return <QuillHtmlBind ref={variableBindRef} />;
      case EditorInputEnum.Object:
        return <CodeBind language="json" ref={variableBindRef} />;
      case EditorInputEnum.HtmlCode:
        return <CodeBind language="html" ref={variableBindRef} />;
      case EditorInputEnum.JavascriptCode:
        return <CodeBind language="javascript" ref={variableBindRef} />;
      case EditorInputEnum.CssCode:
        return <CodeBind language="css" ref={variableBindRef} />;
      default:
        return <TextBind ref={variableBindRef} />;
    }
  }, [data, value]);

  const stringifiedValue = useMemo(() => {
    try {
      const type = data?.opt?.type;
      if (typeof value === 'string') {
        return JSON.stringify(value).slice(1, -1);
      }
      if (type === EditorInputEnum.Object) {
        return stringify(value);
      }
      return 'Unknown value';
    } catch (err) {
      return (err as Error).message;
    }
  }, [value]);

  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      width="70%"
      title={variable.valueBind}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}>
      <Content>
        <VariableContent>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Name>{global.variables}</Name>
            <Radio
              size="small"
              optionType="button"
              options={[
                {
                  label: global.project,
                  value: 0,
                },
                {
                  label: global.application,
                  value: 1,
                },
              ]}
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              style={{ fontSize: 12 }}
            />
          </div>
          <div className="variable-list">
            {loading && <Spin spinning={true} />}
            <ul>
              {variables?.map((variable) => {
                return (
                  <li
                    key={variable.id}
                    onClick={() => {
                      handleClick(`{{${variable.name}}}`);
                    }}>
                    {variable.name}
                    {!!mock?.enable &&
                      !!mock?.schemas?.find((schema) => schema.id === variable.contentId) && (
                        <BugFilled style={{ color: '#FF5918', fontSize: 12, marginLeft: 4 }} />
                      )}
                  </li>
                );
              })}
            </ul>
          </div>
        </VariableContent>
        <BindContent>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Name>{variable.content}</Name>
            <Radio
              size="small"
              optionType="button"
              options={[
                {
                  label: global.edit,
                  value: false,
                },
                {
                  label: global.view,
                  value: true,
                },
              ]}
              value={previewMode}
              onChange={(e) => setPreviewMode(e.target.value)}
              style={{ fontSize: 12 }}
            />
          </div>
          <div className="variable-bind-content">
            <div className="variable-bind-editor">
              {previewMode ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '0 8px',
                    overflow: 'auto',
                    border: '1px solid #1f38584d',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                  {stringifiedValue}
                </div>
              ) : (
                <BindContext.Provider value={{ value: isEmpty(value) ? '' : value, setValue }}>
                  {ContentEditor}
                </BindContext.Provider>
              )}
            </div>
            <div style={{ height: 100, paddingTop: 12 }}>
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
