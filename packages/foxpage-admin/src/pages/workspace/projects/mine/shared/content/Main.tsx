import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/content';
import { checkAuthRole } from '@/actions/workspace/projects/involved/file';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.projects.involved.content.loading,
  contentList: store.workspace.projects.involved.content.contents,
  extendRecord: store.workspace.projects.involved.content.extendRecord,
  fileDetail: store.workspace.projects.involved.content.fileDetail,
  folder: store.workspace.projects.involved.content.folder,
  editContent: store.workspace.projects.involved.content.editContent,
  drawerOpen: store.workspace.projects.involved.content.editorDrawerOpen,
  locales: store.workspace.projects.involved.content.locales,
  saveLoading: store.workspace.projects.involved.content.saveLoading,
  baseContents: store.workspace.projects.involved.content.baseContents,
  authDrawerOpen: store.workspace.projects.involved.content.authListDrawerVisible,
  authLoading: store.workspace.projects.involved.content.authListLoading,
  authList: store.workspace.projects.involved.content.authList,
  userList: store.workspace.projects.involved.content.userList,
  screenshots: store.screenshot.main.screenshots,
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
  checkAuthRole,
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
    folder,
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
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    screenshots,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectContent
      type="involved"
      loading={loading}
      saveLoading={saveLoading}
      contentList={contentList}
      extendRecord={extendRecord}
      drawerOpen={drawerOpen}
      fileDetail={fileDetail}
      folderDetail={folder?.[0] || {}}
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
      checkAuthRole={checkAuthRole}
      fetchAuthList={fetchAuthList}
      fetchUserList={fetchUserList}
      saveUser={saveUser}
      deleteUser={deleteUser}
      screenshots={screenshots}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Content);
