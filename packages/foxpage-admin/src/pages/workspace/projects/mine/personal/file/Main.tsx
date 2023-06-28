import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import { fetchApplicationInfo } from '@/actions/applications/detail/settings/application';
import * as ACTIONS from '@/actions/workspace/projects/personal/file';
import { deleteProject, saveProject } from '@/actions/workspace/projects/personal/folder';
import { ProjectFile } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  application: store.applications.detail.settings.app.application,
  loading: store.workspace.projects.personal.file.loading,
  saveLoading: store.workspace.projects.personal.file.saveLoading,
  pageInfo: store.workspace.projects.personal.file.pageInfo,
  fileList: store.workspace.projects.personal.file.fileList,
  drawerOpen: store.workspace.projects.personal.file.drawerOpen,
  editFile: store.workspace.projects.personal.file.editFile,
  authDrawerOpen: store.workspace.projects.personal.file.authListDrawerVisible,
  authLoading: store.workspace.projects.personal.file.authListLoading,
  authList: store.workspace.projects.personal.file.authList,
  userList: store.workspace.projects.personal.file.userList,
  screenshots: store.screenshot.main.screenshots,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchFileList: ACTIONS.fetchFileList,
  fetchParentFiles: ACTIONS.fetchParentFiles,
  openDrawer: ACTIONS.openEditDrawer,
  updateEditFile: ACTIONS.updateEditFileValue,
  saveFile: ACTIONS.saveFile,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  checkAuthRole: ACTIONS.checkAuthRole,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
  deleteProject,
  saveProject,
  fetchApplicationInfo,
};

type FileListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FileListType> = (props) => {
  const {
    application,
    loading,
    saveLoading,
    pageInfo,
    fileList,
    drawerOpen,
    editFile,
    authDrawerOpen,
    authLoading,
    authList,
    userList,
    clearAll,
    fetchFileList,
    fetchParentFiles,
    openDrawer,
    updateEditFile,
    saveFile,
    openAuthDrawer,
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    deleteProject,
    saveProject,
    fetchApplicationInfo,
    screenshots,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectFile
      type="personal"
      pageInfo={pageInfo}
      loading={loading}
      saveLoading={saveLoading}
      fileList={fileList}
      drawerOpen={drawerOpen}
      editFile={editFile}
      authDrawerOpen={authDrawerOpen}
      authLoading={authLoading}
      authList={authList}
      userList={userList}
      application={application}
      fetchFileList={fetchFileList}
      fetchParentFiles={fetchParentFiles}
      openDrawer={openDrawer}
      updateEditFile={updateEditFile}
      saveFile={saveFile}
      openAuthDrawer={openAuthDrawer}
      checkAuthRole={checkAuthRole}
      fetchAuthList={fetchAuthList}
      fetchUserList={fetchUserList}
      saveUser={saveUser}
      deleteUser={deleteUser}
      deleteProject={deleteProject}
      saveProject={saveProject}
      fetchApplicationInfo={fetchApplicationInfo}
      screenshots={screenshots}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
