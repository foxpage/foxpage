import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/personal/content';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.projects.personal.content.loading,
  contentList: store.workspace.projects.personal.content.contents,
  extendRecord: store.workspace.projects.personal.content.extendRecord,
  fileDetail: store.workspace.projects.personal.content.fileDetail,
  editContent: store.workspace.projects.personal.content.editContent,
  drawerOpen: store.workspace.projects.personal.content.editorDrawerOpen,
  locales: store.workspace.projects.personal.content.locales,
  saveLoading: store.workspace.projects.personal.content.saveLoading,
  baseContents: store.workspace.projects.personal.content.baseContents,
  authDrawerOpen: store.workspace.projects.personal.content.authListDrawerVisible,
  authLoading: store.workspace.projects.personal.content.authListLoading,
  authList: store.workspace.projects.personal.content.authList,
  userList: store.workspace.projects.personal.content.userList,
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
      type="personal"
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
