import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/content';
import {
  checkAuthRole,
  deleteFile,
  openEditDrawer,
  saveFile,
  updateEditFileValue,
} from '@/actions/applications/detail/projects/file';
import { fetchApplicationInfo } from '@/actions/applications/detail/settings/application';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  applicationInfo: store.applications.detail.settings.app.application,
  loading: store.applications.detail.projects.content.loading,
  contentList: store.applications.detail.projects.content.contents,
  extendRecord: store.applications.detail.projects.content.extendRecord,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  folder: store.applications.detail.projects.content.folder,
  editContent: store.applications.detail.projects.content.editContent,
  drawerOpen: store.applications.detail.projects.content.editorDrawerOpen,
  locales: store.applications.detail.projects.content.locales,
  saveLoading: store.applications.detail.projects.content.saveLoading,
  baseContents: store.applications.detail.projects.content.baseContents,
  authDrawerOpen: store.applications.detail.projects.content.authListDrawerVisible,
  authLoading: store.applications.detail.projects.content.authListLoading,
  authList: store.applications.detail.projects.content.authList,
  userList: store.applications.detail.projects.content.userList,
  fileDrawerOpen: store.applications.detail.projects.file.drawerOpen,
  editFile: store.applications.detail.projects.file.editFile,
  fileSaveLoading: store.applications.detail.projects.file.saveLoading,
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
  offlineContent: ACTIONS.offlineContent,
  copyContent: ACTIONS.copyContent,
  saveAsBaseContent: ACTIONS.saveAsBaseContent,
  deleteContent: ACTIONS.deleteContent,
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
      type="application"
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
