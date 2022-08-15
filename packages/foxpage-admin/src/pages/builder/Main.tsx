import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { fetchComponentList } from '@/actions/builder/components';
import { selectContent, updateStoreModalVisible } from '@/actions/builder/header';
import * as ACTIONS from '@/actions/builder/main';
import { FileType } from '@/constants/index';
import { EditDrawer as ConditionEditDrawer } from '@/pages/applications/detail/file/conditions/components';
import { EditDrawer as FunctionEditDrawer } from '@/pages/applications/detail/file/functions/components';
import { EditDrawer as VariableEditDrawer } from '@/pages/applications/detail/file/variables/components';
import { FoxBuilderEvents } from '@/types/builder';

import { Header } from './header';
import {
  BUILDER_WINDOW_EDITOR,
  BUILDER_WINDOW_MODAL,
  ConditionBindDrawer,
  ToolbarModal,
  VariableBindModal,
} from './toolbar';
import Viewer from './Viewer';

const Container = styled.div`
  height: 100%;
  .ant-spin-nested-loading {
    height: calc(100% - 48px);
  }
  .ant-spin-container {
    height: 100%;
  }
`;

const mapStateToProps = (store: RootState) => ({
  application: store.builder.main.application,
  loading: store.builder.main.loading,
  file: store.builder.main.file,
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  fileId: store.builder.header.fileId,
  folderId: store.builder.header.folderId,
  pageList: store.builder.header.pageList,
  components: store.builder.component.components,
});

const mapDispatchToProps = {
  openToolbarEditor: ACTIONS.updateToolbarEditorVisible,
  openToolbarModal: ACTIONS.updateToolbarModalVisible,
  templateBind: ACTIONS.templateOpenInPage,
  selectContent: selectContent,
  clear: ACTIONS.clearAll,
  fetchApp: ACTIONS.fetchApp,
  fetchFile: ACTIONS.fetchFile,
  fetchContent: ACTIONS.fetchContent,
  fetchComponents: fetchComponentList,
  openStoreModal: updateStoreModalVisible,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Builder = (props: IProps) => {
  const {
    loading,
    application,
    file,
    applicationId,
    contentId,
    fileId,
    folderId,
    pageList,
    components,
    openToolbarEditor,
    openToolbarModal,
    selectContent,
    clear,
    fetchComponents,
    fetchApp,
    fetchFile,
    fetchContent,
    templateBind,
    openStoreModal,
  } = props;

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  // supplement fileId and contentId if query string undefined
  useEffect(() => {
    if (pageList.length > 0) {
      // get file with filedId or default by index 0
      const file = !!fileId
        ? pageList.find((item) => item.id === fileId)
        : pageList.find((item) => item.contents && item.contents.length > 0);

      // get content by default index 0
      const contents = file?.contents;
      const content =
        contents && contentId ? contents.find((content) => content.id === contentId) : contents?.[0];

      if (content) {
        // push to store
        const localeTag = content?.tags.filter((item) => item.locale);

        selectContent({
          applicationId,
          fileId: fileId || file?.id,
          contentId: contentId || content.id,
          locale: localeTag && localeTag.length > 0 ? localeTag[0].locale : '',
          fileType: file?.type || FileType.page,
        });
      }
    }
  }, [pageList]);

  useEffect(() => {
    if (applicationId) {
      fetchApp(applicationId);
      fetchComponents(applicationId);
    }
  }, [applicationId]);

  useEffect(() => {
    if (applicationId && fileId) {
      fetchFile({ applicationId, ids: [fileId] });
    }
  }, [applicationId, fileId]);
  
  useEffect(() => {
    if (components.length && application?.id && file.id && contentId) {
      fetchContent({ applicationId: application.id, id: contentId, type: file.type });
    }
  }, [application, contentId, file.id, components.length]);

  const handleWindowChange: FoxBuilderEvents['onWindowChange'] = (target, opt) => {
    if (BUILDER_WINDOW_EDITOR.indexOf(target) > -1) openToolbarEditor(true, target, opt);
    if (BUILDER_WINDOW_MODAL.indexOf(target) > -1) openToolbarModal(true, target, opt);
    if (target === 'templateBind') {
      openStoreModal(true, 'template');
      templateBind(true);
    }
  };

  return (
    <Container>
      <Header />
      <Viewer loading={loading} changeWindow={handleWindowChange} />
      <ConditionEditDrawer applicationId={applicationId} folderId={folderId} />
      <FunctionEditDrawer applicationId={applicationId} folderId={folderId} />
      <VariableEditDrawer applicationId={applicationId} folderId={folderId} />
      <ConditionBindDrawer />
      <ToolbarModal />
      <VariableBindModal />
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Builder);
