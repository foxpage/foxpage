import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/file';
import { ProjectFile } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.projects.file.loading,
  saveLoading: store.applications.detail.projects.file.saveLoading,
  pageInfo: store.applications.detail.projects.file.pageInfo,
  fileList: store.applications.detail.projects.file.fileList,
  drawerOpen: store.applications.detail.projects.file.drawerOpen,
  editFile: store.applications.detail.projects.file.editFile,
  authDrawerOpen: store.applications.detail.projects.file.authListDrawerVisible,
  authLoading: store.applications.detail.projects.file.authListLoading,
  authList: store.applications.detail.projects.file.authList,
  userList: store.applications.detail.projects.file.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchFileList: ACTIONS.fetchFileList,
  fetchParentFiles: ACTIONS.fetchParentFiles,
  openDrawer: ACTIONS.openEditDrawer,
  updateEditFile: ACTIONS.updateEditFileValue,
  saveFile: ACTIONS.saveFile,
  deleteFile: ACTIONS.deleteFile,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
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
    deleteFile,
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
    <ProjectFile
      type="application"
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
      deleteFile={deleteFile}
      openAuthDrawer={openAuthDrawer}
      fetchAuthList={fetchAuthList}
      fetchUserList={fetchUserList}
      saveUser={saveUser}
      deleteUser={deleteUser}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
