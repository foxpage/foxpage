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
  authDrawerOpen: store.applications.detail.projects.folder.authListDrawerVisible,
  authLoading: store.applications.detail.projects.folder.authListLoading,
  authList: store.applications.detail.projects.folder.authList,
  userList: store.applications.detail.projects.folder.userList,
  drawerOpen: store.applications.detail.projects.folder.drawerOpen,
  editProject: store.applications.detail.projects.folder.editProject,
  applicationList: store.applications.detail.projects.folder.apps,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchProjectList: ACTIONS.fetchProjectList,
  openDrawer: ACTIONS.openEditDrawer,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
  fetchApps: ACTIONS.fetchApps,
  updateEditProject: ACTIONS.updateEditProjectValue,
  saveProject: ACTIONS.saveProject,
  deleteProject: ACTIONS.deleteProject,
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
    authDrawerOpen,
    authLoading,
    authList,
    userList,
    clearAll,
    fetchProjectList,
    fetchApps,
    updateEditProject,
    saveProject,
    deleteProject,
    openDrawer,
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
      authDrawerOpen={authDrawerOpen}
      authLoading={authLoading}
      authList={authList}
      userList={userList}
      fetchList={fetchProjectList}
      fetchApps={fetchApps}
      updateEditProject={updateEditProject}
      saveProject={saveProject}
      deleteProject={deleteProject}
      openDrawer={openDrawer}
      openAuthDrawer={openAuthDrawer}
      fetchAuthList={fetchAuthList}
      fetchUserList={fetchUserList}
      saveUser={saveUser}
      deleteUser={deleteUser}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
