import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/folder';
import { ProjectFolder } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.user.organizationId,
  saveLoading: store.workspace.projects.involved.folder.saveLoading,
  loading: store.workspace.projects.involved.folder.loading,
  pageInfo: store.workspace.projects.involved.folder.pageInfo,
  projectList: store.workspace.projects.involved.folder.projectList,
  authDrawerOpen: store.workspace.projects.involved.folder.authListDrawerVisible,
  authLoading: store.workspace.projects.involved.folder.authListLoading,
  authList: store.workspace.projects.involved.folder.authList,
  userList: store.workspace.projects.involved.folder.userList,
  drawerOpen: store.workspace.projects.involved.folder.drawerOpen,
  editProject: store.workspace.projects.involved.folder.editProject,
  applicationList: store.workspace.projects.involved.folder.apps,
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
      type="involved"
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
