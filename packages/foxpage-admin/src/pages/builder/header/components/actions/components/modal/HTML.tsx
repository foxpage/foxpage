import React, { useContext } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from 'react-redux';

import { Button, message, Modal, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { CodeEditor } from '@/pages/components/common';
import { GlobalContext } from '@/pages/system';

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
  open: store.builder.header.htmlModalVisible,
  loading: store.builder.header.htmlLoading,
  html: store.builder.header.html,
});

const mapDispatchToProps = {
  openHTMLModal: ACTIONS.updateHTMLModalVisible,
};

type DslProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const HTML: React.FC<DslProps> = (props) => {
  const { open, loading, html, openHTMLModal } = props;

  const { locale } = useContext(GlobalContext);
  const { content: contentI18n, global } = locale.business;

  const handleOnCancel = () => {
    openHTMLModal(false);
  };

  const handleOnCopy = () => {
    message.success(global.copySuccess);

    setTimeout(handleOnCancel, 150);
  };

  return (
    <StyledModal
      title="HTML"
      width={1048}
      open={open}
      footer={[
        <Button key="cancel" type="ghost" onClick={handleOnCancel}>
          {global.cancel}
        </Button>,
        <CopyToClipboard key="copy" text={html} onCopy={handleOnCopy}>
          <Button type="primary">{contentI18n.copy}</Button>
        </CopyToClipboard>,
      ]}
      onCancel={handleOnCancel}
      style={{ height: '70%' }}>
      {loading ? (
        <Spin spinning={loading} />
      ) : (
        <CodeEditor value={html} readOnly language="html" height={'100%'} />
      )}
    </StyledModal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HTML);
