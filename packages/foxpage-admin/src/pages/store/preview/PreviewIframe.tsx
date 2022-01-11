import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Input, Modal as AntdModal, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';

const mapStateToProps = (store: RootState) => ({
  loading: store.store.list.loading,
  previewModalVisible: store.store.list.previewModalVisible,
  selectedItem: store.store.list.selectedItem,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type StoreResourcePreviewIframeProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PreviewIframe: React.FC<StoreResourcePreviewIframeProps> = props => {
  return <div>12</div>;
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewIframe);
