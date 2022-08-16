import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/folder';
import { ProjectFolder } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.user.organizationId,
  loading: store.projects.folder.loading,
  saveLoading: store.projects.folder.saveLoading,
  pageInfo: store.projects.folder.pageInfo,
  projectList: store.projects.folder.projectList,
  editProject: store.projects.folder.editProject,
  applicationList: store.projects.folder.apps,
  drawerOpen: store.projects.folder.drawerOpen,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchProjectList: ACTIONS.fetchProjectList,
  fetchApps: ACTIONS.fetchApps,
  updateEditProject: ACTIONS.updateEditProjectValue,
  saveProject: ACTIONS.saveProject,
  deleteProject: ACTIONS.deleteProject,
  openDrawer: ACTIONS.openEditDrawer,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = (props) => {
  const {
    organizationId,
    loading,
    saveLoading,
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
    deleteProject,
    openDrawer,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectFolder
      type="projects"
      organizationId={organizationId}
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
      deleteProject={deleteProject}
      openDrawer={openDrawer}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
