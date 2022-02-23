import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { message } from 'antd';
import { RootState } from 'typesafe-actions';

import { fetchPageRenderTree, useTemplate } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { getPageTemplateId } from '@/services/builder';

import TemplateSelectModal from './TemplateSelectModal';

const mapStateToProps = (store: RootState) => ({
  pageTemplateSelectModalOpen: store.builder.templateSelect.pageTemplateSelectModalOpen,
  version: store.builder.template.version,
  contentId: store.builder.page.contentId,
  applicationId: store.builder.page.applicationId,
  fileType: store.builder.page.fileType,
});

const mapDispatchToProps = {
  updatePageTemplateSelectModalOpen: ACTIONS.updatePageTemplateSelectModalOpen,
  useTemplate: useTemplate,
  fetchTree: fetchPageRenderTree,
};

type PageTemplateSelectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageTemplateSelect: React.FC<PageTemplateSelectType> = props => {
  const {
    contentId,
    applicationId,
    version,
    pageTemplateSelectModalOpen,
    fileType,
    updatePageTemplateSelectModalOpen,
    useTemplate,
    fetchTree,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;
  useEffect(() => {
    setTemplateId(getPageTemplateId(version));
  }, [version]);

  const [templateId, setTemplateId] = useState<string | undefined>();

  const handleOnOk = (templateId?: string) => {
    if (!templateId) {
      message.warning(builder.selectTemplateError);
      return;
    }
    if (templateId) {
      useTemplate(
        applicationId,
        () => {
          updatePageTemplateSelectModalOpen(false);
          fetchTree(applicationId, contentId, fileType);
        },
        templateId,
      );
    } else {
      updatePageTemplateSelectModalOpen(false);
    }
  };

  return (
    <TemplateSelectModal
      title={builder.selectTemplateModalTitle}
      fileType={FileTypeEnum.template}
      open={pageTemplateSelectModalOpen}
      templateId={templateId}
      onCancel={() => {
        updatePageTemplateSelectModalOpen(false);
      }}
      onOk={handleOnOk}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageTemplateSelect);
