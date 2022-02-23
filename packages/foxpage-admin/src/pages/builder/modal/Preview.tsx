import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Modal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import GlobalContext from '@/pages/GlobalContext';

const StyledModal = styled(Modal)`
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 110px);
      padding: 12px;
    }
  }
`;

const mapStateToProps = (store: RootState) => ({
  previewModalVisible: store.builder.template.previewModalVisible,
  version: store.builder.template.version,
  renderHtml: store.builder.ssr.renderHtml,
  editStatus: store.builder.template.editStatus,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
  fetchRenderHtml: ACTIONS.fetchSsrHtml,
  saveToServer: ACTIONS.saveToServer,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<Type> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { editStatus, previewModalVisible, renderHtml, updatePreviewModalVisible, fetchRenderHtml, saveToServer } =
    props;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;
  useEffect(() => {
    if (iframeRef.current && !previewModalVisible) {
      const frameDocument = iframeRef.current.contentDocument;
      if (frameDocument) {
        frameDocument.body.innerHTML = '';
      }
    }
  }, [previewModalVisible]);

  useEffect(() => {
    if (previewModalVisible && iframeRef.current) {
      if (editStatus) {
        saveToServer(applicationId, () => {
          fetchRenderHtml(applicationId);
        });
      } else {
        fetchRenderHtml(applicationId);
      }
    }
  }, [previewModalVisible]);

  useEffect(() => {
    if (previewModalVisible && iframeRef.current && renderHtml) {
      const frameDocument = iframeRef.current.contentDocument;
      if (frameDocument) {
        setTimeout(() => {
          frameDocument.body.innerHTML = renderHtml;
          // frameDocument.write(renderHtml);
          frameDocument.body.style.margin = '0px';
        });
      }
    }
  }, [previewModalVisible, renderHtml]);

  const onOk = () => {
    updatePreviewModalVisible(false);
  };

  return (
    <StyledModal
      title={builder.preview}
      visible={previewModalVisible}
      width={1048}
      onOk={onOk}
      style={{ height: '70%' }}
      onCancel={() => {
        updatePreviewModalVisible(false);
      }}
    >
      <iframe ref={iframeRef} frameBorder="0" scrolling="yes" width="100%" height="100%" />
    </StyledModal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
