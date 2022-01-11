import React from 'react';
import { connect } from 'react-redux';

import { message } from 'antd';
import { RootState } from 'typesafe-actions';

import { clonePage, fetchPageRenderTree } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/index';

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

  const handleOnOk = (sourceContentId?: string) => {
    if (!sourceContentId) {
      message.warning('Please select page');
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
      title="Select Page"
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
