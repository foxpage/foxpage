import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Input, Modal as AntdModal, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import JSONEditor from '@/components/business/JsonEditor';

const mapStateToProps = (store: RootState) => ({
  loading: store.store.list.loading,
  previewModalVisible: store.store.list.previewModalVisible,
  selectedItem: store.store.list.selectedItem,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type DslProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Dsl: React.FC<DslProps> = props => {
  return <JSONEditor jsonData={{ a: { b: 2 } }} options={{ mode: 'view' }}></JSONEditor>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Dsl);
