import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/file';
import { deleteProject } from '@/actions/workspace/projects/involved/folder';
import { ProjectFile } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.projects.involved.file.loading,
  saveLoading: store.workspace.projects.involved.file.saveLoading,
  pageInfo: store.workspace.projects.involved.file.pageInfo,
  fileList: store.workspace.projects.involved.file.fileList,
  drawerOpen: store.workspace.projects.involved.file.drawerOpen,
  editFile: store.workspace.projects.involved.file.editFile,
  authDrawerOpen: store.workspace.projects.involved.file.authListDrawerVisible,
  authLoading: store.workspace.projects.involved.file.authListLoading,
  authList: store.workspace.projects.involved.file.authList,
  userList: store.workspace.projects.involved.file.userList,
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
};

type FileListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FileListType> = (props) => {
  const {
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
    screenshots,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectFile
      type="involved"
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
      screenshots={screenshots}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
