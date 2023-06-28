import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { message } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { fetchComponentList } from '@/actions/builder/components';
import { selectContent, updateStoreModalVisible } from '@/actions/builder/header';
import * as LOCKER_ACTIONS from '@/actions/builder/locker';
import * as ACTIONS from '@/actions/builder/main';
import * as RECORD_ACTIONS from '@/actions/record/index';
import { FileType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { EditDrawer as ConditionEditDrawer } from '@/pages/applications/detail/file/conditions/components';
import { EditDrawer as VariableEditDrawer } from '@/pages/applications/detail/file/variables/components';
import { fetchUserRecordStatus } from '@/store/actions/record';
import { checkExist, clearCache } from '@/store/sagas/builder/services';
import { FoxBuilderEvents } from '@/types/index';

import { Notice } from '../notice';

import { Header } from './header';
import LockerNotice from './LockerNotice';
import { BUILDER_WINDOW_EDITOR, BUILDER_WINDOW_MODAL, ToolbarModal, VariableBindModal } from './toolbar';
import Viewer from './Viewer';

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
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  fileId: store.builder.header.fileId,
  folderId: store.builder.header.folderId,
  pageList: store.builder.header.pageList,
  components: store.builder.component.components,
  locale: store.builder.header.locale,
});

const mapDispatchToProps = {
  openToolbarEditor: ACTIONS.updateToolbarEditorVisible,
  openToolbarModal: ACTIONS.updateToolbarModalVisible,
  templateBind: ACTIONS.templateOpenInPage,
  clearByContentChange: ACTIONS.clearByContentChange,
  resetClientContentTime: LOCKER_ACTIONS.resetClientContentTime,
  clear: ACTIONS.clearAll,
  fetchApp: ACTIONS.fetchApp,
  fetchFile: ACTIONS.fetchFile,
  fetchContent: ACTIONS.fetchContent,
  deleteComponentMock: ACTIONS.deleteComponentMock,
  clearLocalRecord: RECORD_ACTIONS.clearLocalRecord,
  selectContent: selectContent,
  fetchComponents: fetchComponentList,
  openStoreModal: updateStoreModalVisible,
  fetchUserRecordStatus,
  startHeartBeat: () => ACTIONS.handleHeartBeatCheck(true),
  stopHeartBeat: () => ACTIONS.handleHeartBeatCheck(false),
  stopLockerManager: () => ACTIONS.handleLockerManager(false),
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Builder = (props: IProps) => {
  const {
    loading,
    application,
    file,
    applicationId,
    contentId,
    content,
    fileId,
    folderId,
    pageList,
    components,
    pageContent,
    openToolbarEditor,
    openToolbarModal,
    selectContent,
    clear,
    clearByContentChange,
    resetClientContentTime,
    fetchComponents,
    fetchApp,
    fetchFile,
    fetchContent,
    templateBind,
    openStoreModal,
    deleteComponentMock,
    locale,
    fetchUserRecordStatus,
    startHeartBeat,
    clearLocalRecord,
    lockerState,
    stopHeartBeat,
    stopLockerManager,
  } = props;

  const lockerStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    lockerStateRef.current = lockerState.blocked;
  }, [lockerState.blocked]);

  useEffect(() => {
    // todo: clear all cache on load
    clearCache('-1').then(() => {
      clearLocalRecord();
    });
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
    }
  }, [applicationId]);

  useEffect(() => {
    if (applicationId && locale !== undefined) {
      fetchComponents(applicationId, locale);
    }
  }, [applicationId, locale]);

  useEffect(() => {
    if (applicationId && fileId) {
      fetchFile({ applicationId, ids: [fileId] });
    }
  }, [applicationId, fileId]);

  useEffect(() => {
    if (contentId) {
      checkExist(contentId).then((result) => {
        if (!result) {
          clearByContentChange(contentId);
          resetClientContentTime();
        }
      });
    }
  }, [contentId]);

  useEffect(() => {
    if (applicationId && contentId) {
      fetchUserRecordStatus({ applicationId, contentId });
    }
  }, [applicationId, contentId]);

  useEffect(() => {
    if (components.length && application?.id && file?.id && contentId) {
      fetchContent({ applicationId: application.id, id: contentId, type: file.type });
    }
  }, [application?.id, contentId, file?.id, components.length]);

  useEffect(() => {
    if (content.id && pageContent.id && application?.id) {
      startHeartBeat();
    }
    return () => {
      stopHeartBeat();
      stopLockerManager();
    };
  }, [content.id, pageContent.id, application?.id]);

  const handleWindowChange: FoxBuilderEvents['onWindowChange'] = (target, opt) => {
    // event listener will not work with react state here, use ref to solve it;
    if (lockerStateRef.current) {
      message.error(getBusinessI18n().content.lockedAlert);
      return;
    }
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
      <Header />
      <Notice />
      <LockerNotice />
      <Viewer key={locale} loading={loading} changeWindow={handleWindowChange} />
      <ConditionEditDrawer applicationId={applicationId} folderId={folderId} pageContentId={contentId} />
      <VariableEditDrawer applicationId={applicationId} folderId={folderId} pageContentId={contentId} />
      <ToolbarModal />
      <VariableBindModal />
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Builder);
