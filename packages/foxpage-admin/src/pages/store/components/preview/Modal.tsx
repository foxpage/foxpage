import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { Modal as AntdModal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { GlobalContext } from '@/pages/system';

import BasicInfo from './components/BasicInfo';

const Modal = styled(AntdModal)`
  height: 80%;
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 55px);
      overflow-y: auto;
    }
  }
`;

const mapStateToProps = (store: RootState) => ({
  previewModalVisible: store.store.list.previewModalVisible,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type StoreResourcePreviewProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PreviewModal: React.FC<StoreResourcePreviewProps> = (props) => {
  const { previewModalVisible, updatePreviewModalVisible } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  const handleClose = () => {
    updatePreviewModalVisible(false);
  };

  return (
    <Modal
      width="80%"
      destroyOnClose
      maskClosable={false}
      title={builder.preview}
      footer={null}
      open={previewModalVisible}
      onCancel={handleClose}>
      <BasicInfo />
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewModal);
