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
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchFileList: ACTIONS.fetchFileList,
  fetchParentFiles: ACTIONS.fetchParentFiles,
  openDrawer: ACTIONS.openEditDrawer,
  updateEditFile: ACTIONS.updateEditFileValue,
  saveFile: ACTIONS.saveFile,
  deleteFile: ACTIONS.deleteFile,
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
    clearAll,
    fetchFileList,
    fetchParentFiles,
    openDrawer,
    updateEditFile,
    saveFile,
    deleteFile,
    deleteProject,
    saveProject,
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
      fetchFileList={fetchFileList}
      fetchParentFiles={fetchParentFiles}
      openDrawer={openDrawer}
      updateEditFile={updateEditFile}
      saveFile={saveFile}
      deleteFile={deleteFile}
      deleteProject={deleteProject}
      saveProject={saveProject}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
