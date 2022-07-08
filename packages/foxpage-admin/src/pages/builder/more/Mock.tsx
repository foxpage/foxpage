import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { CloudUploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, message, Modal as AntModal, Spin, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/more';
import * as TEMPLATE_ACTIONS from '@/actions/builder/template';
import JSONEditor from '@/components/business/JsonEditor';
import GlobalContext from '@/pages/GlobalContext';
import { MockContent } from '@/types/builder';

import { PublishIcon } from '../../common/CustomIcon';

const Modal = styled(AntModal)`
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 110px);
      padding: 12px;
      overflow: auto;
    }
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 28px;
  margin-bottom: 8px;
`;
const BodyWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 36px);
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.page.applicationId,
  folderId: store.builder.page.folderId,
  contentId: store.builder.page.contentId,
  visible: store.builder.more.mockModalVisible,
  loading: store.builder.more.mockLoading,
  mockModeEnable: store.builder.more.mockModeEnable,
  mockId: store.builder.more.mockId,
  mock: store.builder.more.mock,
});

const mapDispatchToProps = {
  updatePageEditStatus: TEMPLATE_ACTIONS.updatePageEditStatus,
  updateMockModalVisible: ACTIONS.updateMockModalVisible,
  updateMockMode: ACTIONS.updateMockMode,
  updateMock: ACTIONS.pushMock,
  saveMock: ACTIONS.addMock,
  publishMock: ACTIONS.publishMock,
};

type DslProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Dsl: React.FC<DslProps> = (props) => {
  const {
    applicationId,
    folderId,
    contentId,
    visible,
    loading,
    mockModeEnable,
    mockId,
    mock,
    updatePageEditStatus,
    updateMockModalVisible,
    updateMockMode,
    updateMock,
    saveMock,
    publishMock,
  } = props;
  const [mockMode, setMockMode] = useState<boolean>(mockModeEnable);
  const [jsonData, setJsonData] = useState<MockContent>({} as MockContent);

  useEffect(() => {
    if (visible) {
      if (mock && mock.schemas && mock.schemas.length > 0) {
        setJsonData(mock);
      }
    } else {
      // clear all when hidden
      setMockMode(mockModeEnable);
      setJsonData({} as MockContent);
    }
  }, [visible, mockModeEnable, mock]);

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global, mock: language } = locale.business;

  const handleClose = useCallback(() => {
    updateMockModalVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    updateMockMode(mockMode);

    // close modal
    handleClose();
  }, [mockMode, handleClose]);

  const handleChange = useCallback(
    (status: boolean) => {
      setMockMode(status);

      // update page edit status
      updatePageEditStatus(true);

      // update mock data
      const newMock = {
        ...mock,
        enable: status,
      };
      updateMock(newMock);
    },
    [jsonData, updatePageEditStatus, mock, updateMock],
  );

  const handleSave = useCallback(() => {
    if (applicationId && folderId) {
      saveMock(
        {
          applicationId,
          folderId,
          contentId: contentId || '',
          name: `mock_${contentId}`,
          content: {
            ...mock,
            enable: mockMode,
          },
        },
        () => {
          message.success(global.saveSuccess);
        },
      );
    }
  }, [applicationId, folderId, contentId, mock, mockMode, saveMock]);

  const handlePublish = useCallback(() => {
    if (applicationId && mockId) {
      saveMock(
        {
          applicationId,
          folderId,
          contentId: contentId || '',
          name: `mock_${contentId}`,
          content: {
            ...mock,
            enable: mockMode,
          },
        },
        (id) => {
          if (id)
            publishMock({
              applicationId,
              id,
              status: 'release',
            });
        },
      );
    }
  }, [applicationId, folderId, contentId, mock, mockMode, saveMock, mockId, publishMock]);

  return (
    <Modal
      title={language.title}
      destroyOnClose
      width={1048}
      visible={visible}
      onOk={handleConfirm}
      onCancel={handleClose}
      style={{ height: '70%' }}>
      <Header>
        <Checkbox checked={mockMode} onChange={(e) => handleChange(e.target.checked)}>
          {language.enableMockMode}{' '}
          <Tooltip title={language.enableMockTips}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Checkbox>
        <Button type="ghost" size="small" onClick={handleSave} style={{ marginLeft: 8 }}>
          <CloudUploadOutlined /> {global.save}
        </Button>
        <Button
          type="primary"
          size="small"
          disabled={!mockId}
          onClick={handlePublish}
          style={{ marginLeft: 8 }}>
          <PublishIcon style={{ verticalAlign: 'bottom' }} /> {global.publish}
        </Button>
      </Header>
      <BodyWrapper>
        {loading ? (
          <Spin spinning={loading} />
        ) : (
          <JSONEditor jsonData={jsonData} refreshFlag={jsonData} readOnly options={{ mode: 'code' }} />
        )}
      </BodyWrapper>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dsl);
