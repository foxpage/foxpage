import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Modal, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/more';
import JSONEditor from '@/components/business/JsonEditor';

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
  open: store.builder.more.dslModalOpen,
  applicationId: store.builder.page.applicationId,
  contentId: store.builder.page.contentId,
  loading: store.builder.more.loading,
  dsl: store.builder.more.dsl,
});

const mapDispatchToProps = {
  updateDslModalOpen: ACTIONS.updateDslModalOpen,
  fetchDsl: ACTIONS.fetchDsl,
};

type DslProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Dsl: React.FC<DslProps> = props => {
  const { open, loading, dsl, contentId, applicationId, fetchDsl, updateDslModalOpen } = props;

  useEffect(() => {
    if (open) {
      fetchDsl({ applicationId, ids: [contentId] });
    }
  }, [open]);

  const onCancel = () => {
    updateDslModalOpen(false);
  };

  return (
    <StyledModal title="DSL" visible={open} width={1048} onOk={onCancel} style={{ height: '70%' }} onCancel={onCancel}>
      {loading ? (
        <Spin spinning={loading}></Spin>
      ) : (
        <JSONEditor jsonData={dsl || {}} refreshFlag={dsl} readOnly options={{ mode: 'code' }}></JSONEditor>
      )}
    </StyledModal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dsl);
