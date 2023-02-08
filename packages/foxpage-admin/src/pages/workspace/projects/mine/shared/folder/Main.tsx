import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/folder';
import { ProjectFolder } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  saveLoading: store.workspace.projects.involved.folder.saveLoading,
  loading: store.workspace.projects.involved.folder.loading,
  pageInfo: store.workspace.projects.involved.folder.pageInfo,
  projectList: store.workspace.projects.involved.folder.projectList,
  drawerOpen: store.workspace.projects.involved.folder.drawerOpen,
  editProject: store.workspace.projects.involved.folder.editProject,
  applicationList: store.workspace.projects.involved.folder.apps,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchProjectList: ACTIONS.fetchProjectList,
  openDrawer: ACTIONS.openEditDrawer,
  fetchApps: ACTIONS.fetchApps,
  updateEditProject: ACTIONS.updateEditProjectValue,
  saveProject: ACTIONS.saveProject,
  deleteProject: ACTIONS.deleteProject,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = (props) => {
  const {
    saveLoading,
    loading,
    pageInfo,
    projectList,
    editProject,
    applicationList,
    drawerOpen,
    clearAll,
    fetchProjectList,
    fetchApps,
    updateEditProject,
    saveProject,
    openDrawer,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectFolder
      type="involved"
      loading={loading}
      saveLoading={saveLoading}
      pageInfo={pageInfo}
      projectList={projectList}
      editProject={editProject}
      applicationList={applicationList}
      drawerOpen={drawerOpen}
      fetchList={fetchProjectList}
      fetchApps={fetchApps}
      updateEditProject={updateEditProject}
      saveProject={saveProject}
      openDrawer={openDrawer}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
