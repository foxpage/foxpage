import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/content';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.projects.content.loading,
  contentList: store.applications.detail.projects.content.contents,
  extendRecord: store.applications.detail.projects.content.extendRecord,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  editContent: store.applications.detail.projects.content.editContent,
  drawerOpen: store.applications.detail.projects.content.editorDrawerOpen,
  locales: store.applications.detail.projects.content.locales,
  saveLoading: store.applications.detail.projects.content.saveLoading,
  baseContents: store.applications.detail.projects.content.baseContents,
  authDrawerOpen: store.applications.detail.projects.content.authListDrawerVisible,
  authLoading: store.applications.detail.projects.content.authListLoading,
  authList: store.applications.detail.projects.content.authList,
  userList: store.applications.detail.projects.content.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchContentList,
  openDrawer: ACTIONS.openEditDrawer,
  commitFileToStore: ACTIONS.commitFileToStore,
  offlineFileFromStore: ACTIONS.offlineFileFromStore,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  fetchParentFiles: ACTIONS.fetchParentFiles,
  updateFileOnlineStatus: ACTIONS.updateFileOnlineStatus,
  updateContentValue: ACTIONS.updateEditContentValue,
  updateContentTags: ACTIONS.updateEditContentTags,
  saveContent: ACTIONS.saveContent,
  deleteContent: ACTIONS.deleteContent,
  fetchLocales: ACTIONS.fetchLocales,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
};

type ProjectContentType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Content: React.FC<ProjectContentType> = (props) => {
  const {
    loading,
    saveLoading,
    contentList,
    extendRecord,
    drawerOpen,
    fileDetail,
    editContent,
    baseContents,
    locales,
    authDrawerOpen,
    authLoading,
    authList,
    userList,
    clearAll,
    fetchList,
    fetchFileDetail,
    fetchParentFiles,
    commitFileToStore,
    offlineFileFromStore,
    updateFileOnlineStatus,
    openDrawer,
    fetchLocales,
    updateContentValue,
    updateContentTags,
    saveContent,
    deleteContent,
    openAuthDrawer,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectContent
      type="application"
      loading={loading}
      saveLoading={saveLoading}
      contentList={contentList}
      extendRecord={extendRecord}
      drawerOpen={drawerOpen}
      fileDetail={fileDetail}
      editContent={editContent}
      baseContents={baseContents}
      locales={locales}
      authDrawerOpen={authDrawerOpen}
      authLoading={authLoading}
      authList={authList}
      userList={userList}
      fetchList={fetchList}
      fetchFileDetail={fetchFileDetail}
      fetchParentFiles={fetchParentFiles}
      commitToStore={commitFileToStore}
      offlineFromStore={offlineFileFromStore}
      updateFileOnlineStatus={updateFileOnlineStatus}
      openDrawer={openDrawer}
      fetchLocales={fetchLocales}
      updateContentValue={updateContentValue}
      updateContentTags={updateContentTags}
      saveContent={saveContent}
      deleteContent={deleteContent}
      openAuthDrawer={openAuthDrawer}
      fetchAuthList={fetchAuthList}
      fetchUserList={fetchUserList}
      saveUser={saveUser}
      deleteUser={deleteUser}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Content);
