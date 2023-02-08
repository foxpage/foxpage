import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/personal/folder';
import { ProjectFolder } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  saveLoading: store.workspace.projects.personal.folder.saveLoading,
  loading: store.workspace.projects.personal.folder.loading,
  pageInfo: store.workspace.projects.personal.folder.pageInfo,
  projectList: store.workspace.projects.personal.folder.projectList,
  drawerOpen: store.workspace.projects.personal.folder.drawerOpen,
  editProject: store.workspace.projects.personal.folder.editProject,
  allApplicationList: store.workspace.projects.personal.folder.allApps,
  applicationList: store.workspace.projects.personal.folder.apps,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchProjectList: ACTIONS.fetchProjectList,
  openDrawer: ACTIONS.openEditDrawer,
  fetchApps: ACTIONS.fetchApps,
  fetchAllApps: ACTIONS.fetchAllApps,
  updateEditProject: ACTIONS.updateEditProjectValue,
  saveProject: ACTIONS.saveProject,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = (props) => {
  const {
    saveLoading,
    loading,
    pageInfo,
    projectList,
    editProject,
    allApplicationList,
    applicationList,
    drawerOpen,
    clearAll,
    fetchProjectList,
    fetchAllApps,
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
      type="personal"
      loading={loading}
      saveLoading={saveLoading}
      pageInfo={pageInfo}
      projectList={projectList}
      editProject={editProject}
      allApplicationList={allApplicationList}
      applicationList={applicationList}
      drawerOpen={drawerOpen}
      fetchList={fetchProjectList}
      fetchAllApps={fetchAllApps}
      fetchApps={fetchApps}
      updateEditProject={updateEditProject}
      saveProject={saveProject}
      openDrawer={openDrawer}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
