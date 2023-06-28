import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import { fetchApplicationInfo } from '@/actions/applications/detail/settings/application';
import * as ACTIONS from '@/actions/projects/content';
import {
  checkAuthRole,
  deleteFile,
  openEditDrawer,
  saveFile,
  updateEditFileValue,
} from '@/actions/projects/file';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  applicationInfo: store.applications.detail.settings.app.application,
  loading: store.projects.content.loading,
  contentList: store.projects.content.contents,
  extendRecord: store.projects.content.extendRecord,
  fileDetail: store.projects.content.fileDetail,
  folder: store.projects.content.folder,
  saveLoading: store.projects.content.saveLoading,
  drawerOpen: store.projects.content.editorDrawerOpen,
  editContent: store.projects.content.editContent,
  locales: store.projects.content.locales,
  baseContents: store.projects.content.baseContents,
  authDrawerOpen: store.projects.content.authListDrawerVisible,
  authLoading: store.projects.content.authListLoading,
  authList: store.projects.content.authList,
  fileDrawerOpen: store.projects.file.drawerOpen,
  editFile: store.projects.file.editFile,
  fileSaveLoading: store.projects.file.saveLoading,
  screenshots: store.screenshot.main.screenshots,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchContentList,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  fetchParentFiles: ACTIONS.fetchParentFiles,
  commitFileToStore: ACTIONS.commitFileToStore,
  offlineFileFromStore: ACTIONS.offlineFileFromStore,
  updateFileOnlineStatus: ACTIONS.updateFileOnlineStatus,
  openDrawer: ACTIONS.updateEditDrawerOpen,
  deleteContent: ACTIONS.deleteContent,
  updateContentValue: ACTIONS.updateEditContentValue,
  updateContentTags: ACTIONS.updateEditContentTags,
  saveContent: ACTIONS.saveContent,
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
    contentList,
    loading,
    fileDetail,
    folder,
    saveLoading,
    extendRecord,
    drawerOpen,
    editContent,
    baseContents,
    locales,
    editFile,
    authDrawerOpen,
    authLoading,
    authList,
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
      type="projects"
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
