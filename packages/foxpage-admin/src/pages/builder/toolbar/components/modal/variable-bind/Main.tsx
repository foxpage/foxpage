import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { BugFilled } from '@ant-design/icons';
import { Modal as AntdModal, Radio as AntRadio, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { variableBind } from '@/actions/builder/events';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { Title } from '@/components/index';
import { EditorInputEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ComponentProps } from '@/types/index';

import { BindContext, HtmlBind, JSONBind, TextBind } from './components';

enum TabEnum {
  project,
  application,
}

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

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

  const variableBindRef = useRef<any>(null);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, variable } = locale.business;

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
      const _value = component?.props?.[keys] || '';

      setValue(_value);
    }
  }, [open, component]);

  const handleClick = (str: string) => {
    variableBindRef.current?.replaceProps(str);
  };

  const handleCancel = () => {
    closeModal(false);
  };

  const handleOk = () => {
    variableBind(keys, value as string, { isMock });
    handleCancel();
  };

  const editorContentByType = useMemo(() => {
    switch (type) {
      case EditorInputEnum.HtmlString:
        return <HtmlBind ref={variableBindRef} />;
      case EditorInputEnum.Object:
        return <JSONBind ref={variableBindRef} />;
      default:
        return <TextBind ref={variableBindRef} />;
    }
  }, [type, value]);

  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      width="60%"
      title={variable.bind}
      visible={open}
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
          <Name>{variable.content}</Name>
          <div className="variable-bind-content">
            <BindContext.Provider value={{ value: value || '', setValue }}>
              {editorContentByType}
            </BindContext.Provider>

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
