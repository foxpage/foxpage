import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { fetchComponentList } from '@/actions/builder/components';
import { selectContent, updateContentInfo, updateStoreModalVisible } from '@/actions/builder/header';
import * as ACTIONS from '@/actions/builder/main';
import { EditDrawer as ConditionEditDrawer } from '@/pages/applications/detail/file/conditions/components';
import { EditDrawer as FunctionEditDrawer } from '@/pages/applications/detail/file/functions/components';
import { EditDrawer as VariableEditDrawer } from '@/pages/applications/detail/file/variables/components';
import { FoxBuilderEvents } from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import {
  BUILDER_WINDOW_EDITOR,
  BUILDER_WINDOW_MODAL,
  ToolbarModal,
  VariableBindModal,
} from '../builder/toolbar';
import Viewer from '../builder/Viewer';
import { Notice } from '../notice';

import Header from './Header';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  .ant-spin-nested-loading {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }
  .ant-spin-container {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }
`;

const mapStateToProps = (store: RootState) => ({
  application: store.builder.main.application,
  content: store.builder.main.content,
  pageContent: store.builder.main.pageContent,
  lockerState: store.builder.main.lockerState,
  loading: store.builder.main.loading,
  file: store.builder.main.file,
  readOnly: store.builder.main.readOnly,
  components: store.builder.component.components,
  locale: store.builder.header.locale,
});

const mapDispatchToProps = {
  openToolbarEditor: ACTIONS.updateToolbarEditorVisible,
  openToolbarModal: ACTIONS.updateToolbarModalVisible,
  templateBind: ACTIONS.templateOpenInPage,
  clear: ACTIONS.clearAll,
  fetchApp: ACTIONS.fetchApp,
  fetchFile: ACTIONS.fetchFile,
  fetchContent: ACTIONS.fetchContent,
  configReadOnly: ACTIONS.configReadOnly,
  deleteComponentMock: ACTIONS.deleteComponentMock,
  selectContent: selectContent,
  fetchComponents: fetchComponentList,
  updateContentInfo: updateContentInfo,
  openStoreModal: updateStoreModalVisible,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Preview = (props: IProps) => {
  const {
    loading,
    application,
    file,
    components,
    pageContent,
    openToolbarEditor,
    openToolbarModal,
    clear,
    fetchComponents,
    fetchApp,
    fetchFile,
    fetchContent,
    templateBind,
    updateContentInfo,
    openStoreModal,
    deleteComponentMock,
    locale,
    readOnly,
    configReadOnly,
  } = props;
  const {
    applicationId = '',
    folderId = '',
    fileId = '',
    contentId = '',
    versionId = '',
  } = getLocationIfo(useLocation());

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    if (!readOnly) {
      configReadOnly(true);
    }
  }, [readOnly]);

  useEffect(() => {
    if (versionId) updateContentInfo({ versionId });
  }, [versionId]);

  useEffect(() => {
    if (applicationId) {
      fetchApp(applicationId);
      fetchComponents(applicationId, locale);
    }
  }, [applicationId, locale]);

  useEffect(() => {
    if (applicationId && fileId) {
      fetchFile({ applicationId, ids: [fileId] });
    }
  }, [applicationId, fileId]);

  useEffect(() => {
    if (components.length && application?.id && file?.id && contentId) {
      fetchContent({ applicationId: application.id, id: contentId, type: file.type, versionId });
    }
  }, [application?.id, contentId, file?.id, components.length]);

  const handleWindowChange: FoxBuilderEvents['onWindowChange'] = (target, opt) => {
    if (BUILDER_WINDOW_EDITOR.indexOf(target) > -1) openToolbarEditor(true, target, opt);
    if (BUILDER_WINDOW_MODAL.indexOf(target) > -1) openToolbarModal(true, target, opt);

    if (target === 'templateBind') {
      openStoreModal(true, 'template');
      templateBind(true);
    }
    if (target === 'pageBind') {
      openStoreModal(true);
    }
    if (target === 'mockDelete' && opt) {
      deleteComponentMock(opt);
    }
  };

  return (
    <Container>
      <Header pageContent={pageContent} />
      <Notice />
      <Viewer key={locale} loading={loading} changeWindow={handleWindowChange} />
      <ConditionEditDrawer applicationId={applicationId} folderId={folderId} />
      <FunctionEditDrawer applicationId={applicationId} folderId={folderId} />
      <VariableEditDrawer applicationId={applicationId} folderId={folderId} />
      <ToolbarModal />
      <VariableBindModal />
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
