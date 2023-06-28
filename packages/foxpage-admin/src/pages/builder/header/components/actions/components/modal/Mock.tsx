import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, Modal as AntModal, Spin, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { MockContent } from '@/types/index';

import * as ACTIONS from '@/actions/builder/header';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { JSONCodeEditor } from '@/pages/components/common';
import { GlobalContext } from '@/pages/system';
import { wrapperMock } from '@/sagas/builder/utils';

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

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  folderId: store.builder.header.folderId,
  contentId: store.builder.header.contentId,
  visible: store.builder.header.mockModalVisible,
  loading: store.builder.header.mockLoading,
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
  file: store.builder.main.file,
  mock: store.builder.main.mock,
});

const mapDispatchToProps = {
  updateMockModalVisible: ACTIONS.updateMockModalVisible,
  saveMock: ACTIONS.saveMock,
  publishMock: ACTIONS.publishMock,
  fetchContent: PAGE_ACTIONS.fetchContent,
  updatePageEditStatus: PAGE_ACTIONS.updateEditState,
};

type MockProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Mock: React.FC<MockProps> = (props) => {
  const {
    applicationId,
    folderId,
    contentId,
    visible,
    loading,
    editStatus,
    file,
    mock,
    updatePageEditStatus,
    updateMockModalVisible,
    saveMock,
    fetchContent,
    publishMock,
  } = props;
  const [mockId, setMockId] = useState<string | undefined>();
  const [mockMode, setMockMode] = useState<boolean>(false);
  const [jsonData, setJsonData] = useState<MockContent>({} as MockContent);

  useEffect(() => {
    if (visible) {
      if (mock && mock?.schemas && mock.schemas.length > 0) {
        setJsonData(wrapperMock(mock) as MockContent);
      }

      setMockId(mock?.id);

      setMockMode(mock?.enable);
    } else {
      // clear all when hidden
      setMockMode(mock?.enable);
      setJsonData({} as MockContent);
    }
  }, [visible, mock]);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, mock: language } = locale.business;

  const handleClose = useCallback(() => {
    updateMockModalVisible(false);
  }, []);

  const handleChange = useCallback(
    (status: boolean) => {
      setMockMode(status);

      // update page edit status
      if (!editStatus) updatePageEditStatus(true);
    },
    [editStatus],
  );

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
  }, [applicationId, folderId, contentId, mockId, jsonData, mockMode, saveMock, publishMock]);

  const handleConfirm = useCallback(() => {
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
          handleClose();

          setTimeout(() => {
            fetchContent({
              applicationId,
              id: contentId,
              type: file?.type,
            });
          }, 50);
        },
      );
    }
  }, [applicationId, folderId, contentId, mock, mockMode, file?.type]);

  const footer = useMemo(
    () => (
      <>
        <Checkbox
          checked={mockMode}
          onChange={(e) => handleChange(e.target.checked)}
          style={{ marginRight: 8 }}>
          {language.enableMockMode}{' '}
          <Tooltip title={language.enableMockTips}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Checkbox>
        <Button type="ghost" onClick={handleClose}>
          {global.cancel}
        </Button>
        <Button type="primary" onClick={handleConfirm}>
          {global.confirm}
        </Button>
        <Button type="primary" disabled={!mockId} onClick={handlePublish}>
          {global.publish}
        </Button>
      </>
    ),
    [mockMode, mockId],
  );

  return (
    <Modal
      title={language.title}
      destroyOnClose
      width={1048}
      open={visible}
      footer={footer}
      onCancel={handleClose}
      style={{ height: '70%' }}>
      {loading ? <Spin spinning={loading} /> : <JSONCodeEditor value={jsonData} readOnly />}
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Mock);
