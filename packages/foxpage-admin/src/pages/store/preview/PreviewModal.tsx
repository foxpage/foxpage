import React from 'react';
import { connect } from 'react-redux';

import { Modal as AntdModal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';

import BasicInfo from './BasicInfo';
// import Dsl from './Dsl';
// import PreviewIframe from './PreviewIframe';

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

// const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  loading: store.store.list.loading,
  previewModalVisible: store.store.list.previewModalVisible,
  selectedItem: store.store.list.selectedItem,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type StoreResourcePreviewProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PreviewModal: React.FC<StoreResourcePreviewProps> = props => {
  const { previewModalVisible, updatePreviewModalVisible } = props;

  const handleClose = () => {
    updatePreviewModalVisible(false);
  };

  return (
    <Modal
      width="80%"
      title="Preview"
      destroyOnClose
      maskClosable={false}
      visible={previewModalVisible}
      onCancel={handleClose}
      footer={null}
    >
      <BasicInfo />
      {/* <Tabs centered size="large" destroyInactiveTabPane defaultActiveKey="preview">
        <TabPane tab="Preview" key="preview">
          <PreviewIframe />
        </TabPane>
        <TabPane tab="Dsl" key="dsl">
          <Dsl />
        </TabPane>
      </Tabs> */}
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewModal);
