import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/folder';
import { ProjectFolder } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.user.organizationId,
  saveLoading: store.applications.detail.projects.folder.saveLoading,
  loading: store.applications.detail.projects.folder.loading,
  pageInfo: store.applications.detail.projects.folder.pageInfo,
  projectList: store.applications.detail.projects.folder.projectList,
  drawerOpen: store.applications.detail.projects.folder.drawerOpen,
  editProject: store.applications.detail.projects.folder.editProject,
  applicationList: store.applications.detail.projects.folder.apps,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchProjectList: ACTIONS.fetchProjectList,
  openDrawer: ACTIONS.openEditDrawer,
  fetchApps: ACTIONS.fetchApps,
  updateEditProject: ACTIONS.updateEditProjectValue,
  saveProject: ACTIONS.saveProject,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = (props) => {
  const {
    organizationId,
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
      type="application"
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
      openDrawer={openDrawer}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
