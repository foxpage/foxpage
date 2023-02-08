import React from 'react';
import { connect } from 'react-redux';

import { Modal, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { JSONCodeEditor } from '@/pages/components/common';

const StyledModal = styled(Modal)`
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
  open: store.builder.header.dslModalVisible,
  loading: store.builder.header.dslLoading,
  dsl: store.builder.header.dsl,
});

const mapDispatchToProps = {
  openDSLModal: ACTIONS.updateDSLModalVisible,
};

type DslProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Dsl: React.FC<DslProps> = (props) => {
  const { open, loading, dsl: dslObj, openDSLModal } = props;

  return (
    <StyledModal
      title="DSL"
      open={open}
      width={1048}
      onCancel={() => openDSLModal(false)}
      onOk={() => openDSLModal(false)}
      style={{ height: '70%' }}>
      {loading ? <Spin spinning={loading} /> : <JSONCodeEditor value={dslObj} readOnly height={'100%'} />}
    </StyledModal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dsl);
