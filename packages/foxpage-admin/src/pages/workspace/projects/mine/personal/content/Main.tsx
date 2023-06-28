import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import { fetchApplicationInfo } from '@/actions/applications/detail/settings/application';
import * as ACTIONS from '@/actions/workspace/projects/personal/content';
import {
  checkAuthRole,
  deleteFile,
  openEditDrawer,
  saveFile,
  updateEditFileValue,
} from '@/actions/workspace/projects/personal/file';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  applicationInfo: store.applications.detail.settings.app.application,
  loading: store.workspace.projects.personal.content.loading,
  contentList: store.workspace.projects.personal.content.contents,
  extendRecord: store.workspace.projects.personal.content.extendRecord,
  fileDetail: store.workspace.projects.personal.content.fileDetail,
  folder: store.workspace.projects.personal.content.folder,
  editContent: store.workspace.projects.personal.content.editContent,
  drawerOpen: store.workspace.projects.personal.content.editorDrawerOpen,
  locales: store.workspace.projects.personal.content.locales,
  saveLoading: store.workspace.projects.personal.content.saveLoading,
  baseContents: store.workspace.projects.personal.content.baseContents,
  authDrawerOpen: store.workspace.projects.personal.content.authListDrawerVisible,
  authLoading: store.workspace.projects.personal.content.authListLoading,
  authList: store.workspace.projects.personal.content.authList,
  userList: store.workspace.projects.personal.content.userList,
  fileDrawerOpen: store.workspace.projects.personal.file.drawerOpen,
  editFile: store.workspace.projects.personal.file.editFile,
  fileSaveLoading: store.workspace.projects.personal.file.saveLoading,
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
  offlineContent: ACTIONS.offlineContent,
  copyContent: ACTIONS.copyContent,
  saveAsBaseContent: ACTIONS.saveAsBaseContent,
  fetchLocales: ACTIONS.fetchLocales,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
  checkAuthRole,
  deleteFile,
  saveFile,
  openEditDrawer,
  updateEditFileValue,
  fetchApplicationInfo,
};

type ProjectContentType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Content: React.FC<ProjectContentType> = (props) => {
  const {
    applicationInfo,
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
    editFile,
    fileDrawerOpen,
    fileSaveLoading,
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
    offlineContent,
    copyContent,
    saveAsBaseContent,
    deleteContent,
    openAuthDrawer,
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    deleteFile,
    saveFile,
    openEditDrawer,
    updateEditFileValue,
    fetchApplicationInfo,
    screenshots,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectContent
      type="personal"
      applicationInfo={applicationInfo}
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
      editFile={editFile}
      fileDrawerOpen={fileDrawerOpen}
      fileSaveLoading={fileSaveLoading}
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
      offlineContent={offlineContent}
      copyContent={copyContent}
      saveAsBaseContent={saveAsBaseContent}
      deleteContent={deleteContent}
      openAuthDrawer={openAuthDrawer}
      checkAuthRole={checkAuthRole}
      fetchAuthList={fetchAuthList}
      fetchUserList={fetchUserList}
      saveUser={saveUser}
      deleteUser={deleteUser}
      deleteFile={deleteFile}
      saveFile={saveFile}
      updateFile={openEditDrawer}
      updateEditFile={updateEditFileValue}
      fetchApplicationInfo={fetchApplicationInfo}
      screenshots={screenshots}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Content);
