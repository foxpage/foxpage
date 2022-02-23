import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { message } from 'antd';
import { RootState } from 'typesafe-actions';

import { clonePage, fetchPageRenderTree } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';

import TemplateSelectModal from './TemplateSelectModal';

const mapStateToProps = (store: RootState) => ({
  pageCopyModalOpen: store.builder.templateSelect.pageCopyModalOpen,
  contentId: store.builder.page.contentId,
  applicationId: store.builder.page.applicationId,
  fileType: store.builder.page.fileType,
});

const mapDispatchToProps = {
  updatePageCopyModalOpen: ACTIONS.updatePageCopyModalOpen,
  clonePage: clonePage,
  fetchTree: fetchPageRenderTree,
};

type PageCopyType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageCopy: React.FC<PageCopyType> = props => {
  const { contentId, applicationId, pageCopyModalOpen, fileType, updatePageCopyModalOpen, clonePage, fetchTree } =
    props;
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;
  const handleOnOk = (sourceContentId?: string) => {
    if (!sourceContentId) {
      message.warning(builder.selectPageError);
      return;
    }

    clonePage({
      applicationId,
      targetContentId: contentId,
      sourceContentId,
      onSuccess: () => {
        updatePageCopyModalOpen(false);
        fetchTree(applicationId, contentId, fileType);
      },
    });
  };

  return (
    <TemplateSelectModal
      title={builder.selectPageModalTitle}
      fileType={FileTypeEnum.page}
      open={pageCopyModalOpen}
      onCancel={() => {
        updatePageCopyModalOpen(false);
      }}
      onOk={handleOnOk}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageCopy);
