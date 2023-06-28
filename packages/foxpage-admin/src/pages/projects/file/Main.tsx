import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/file';
import { deleteProject, saveProject } from '@/actions/projects/folder';
import { ProjectFile } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.projects.file.pageInfo,
  loading: store.projects.file.loading,
  saveLoading: store.projects.file.saveLoading,
  fileList: store.projects.file.fileList,
  drawerOpen: store.projects.file.drawerOpen,
  editFile: store.projects.file.editFile,
  authDrawerOpen: store.projects.file.authListDrawerVisible,
  authLoading: store.projects.file.authListLoading,
  authList: store.projects.file.authList,
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
};

type FileListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FileListType> = (props) => {
  const {
    pageInfo,
    loading,
    saveLoading,
    fileList,
    drawerOpen,
    editFile,
    authDrawerOpen,
    authLoading,
    authList,
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
    screenshots,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectFile
      type="projects"
      pageInfo={pageInfo}
      loading={loading}
      saveLoading={saveLoading}
      fileList={fileList}
      drawerOpen={drawerOpen}
      editFile={editFile}
      authDrawerOpen={authDrawerOpen}
      authLoading={authLoading}
      authList={authList}
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
      screenshots={screenshots}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
