import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { Button, Modal, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { Pagination } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/applications/detail/file/pages/version';

import { List } from './List';

const Container = styled.div`
  min-height: 300px;
  max-height: 500px;
  padding: 24px;
  overflow-y: auto;
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.file.pages.version.loading,
  pageInfo: store.applications.detail.file.pages.version.pageInfo,
  list: store.applications.detail.file.pages.version.list,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetch: ACTIONS.fetchVersions,
};

type PageListType = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    applicationId: string;
    folderId: string;
    fileId: string;
    contentId: string;
    visible: boolean;
    contentName?: string;
    fileType: string;
    closeFunc: () => void;
  };

const VersionList: React.FC<PageListType> = (props) => {
  const {
    applicationId,
    folderId,
    fileId,
    contentId,
    visible = false,
    pageInfo,
    list,
    contentName,
    fileType,
    closeFunc,
    fetch,
    clearAll,
    loading,
  } = props;
  // i18n
  const { locale } = useContext(GlobalContext);
  const { history, global } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (contentId) {
      fetch({
        applicationId,
        contentId,
        fileType,
        page: 1,
        size: 10,
      });
    }
  }, [contentId]);

  const handleFetch = (page: number) => {
    fetch({
      applicationId,
      contentId,
      fileType,
      page,
      size: 10,
    });
  };

  const handleView = () => {
    closeFunc();
  };

  const handleClose = () => {
    closeFunc();
    clearAll();
  };

  return (
    <Modal
      title={`${history.versions} - ${contentName}(${contentId})`}
      open={visible}
      maskClosable={false}
      width="60%"
      bodyStyle={{ padding: 0 }}
      onOk={handleClose}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          {global.cancel}
        </Button>,
      ]}>
      <Container>
        <Spin spinning={loading}>
          <List
            applicationId={applicationId}
            folderId={folderId}
            fileId={fileId}
            list={list}
            onClick={handleView}
          />
        </Spin>
        <Pagination
          hideOnSinglePage
          current={pageInfo.page}
          total={pageInfo.total || 0}
          pageSize={pageInfo.size}
          onChange={(page) => handleFetch(page)}
          style={{ textAlign: 'center', padding: '24px 0 0 0' }}
        />
      </Container>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionList);
