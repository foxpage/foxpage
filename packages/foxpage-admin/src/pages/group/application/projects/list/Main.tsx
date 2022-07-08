import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/list';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import { AuthorizeDrawer } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';

import EditDrawer from './EditDrawer';
import List from './List';

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  application: store.group.application.settings.application,
  pageInfo: store.workspace.projects.project.list.pageInfo,
  editProject: store.workspace.projects.project.list.editProject,
  visible: store.workspace.projects.project.list.authListDrawerVisible,
  authLoading: store.workspace.projects.project.list.authListLoading,
  authList: store.workspace.projects.project.list.authList,
  userList: store.workspace.projects.project.list.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchProjectList: ACTIONS.fetchProjectList,
  openDrawer: ACTIONS.setAddDrawerOpenStatus,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  addUser: ACTIONS.authAddUser,
  deleteUser: ACTIONS.authDeleteUser,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = (props) => {
  const {
    organizationId,
    application,
    pageInfo = { page: 1, size: 10 },
    editProject,
    visible,
    authLoading,
    authList,
    userList,
    fetchProjectList,
    clearAll,
    openDrawer,
    openAuthDrawer,
    fetchAuthList,
    fetchUserList,
    addUser,
    deleteUser,
  } = props;
  const [applicationId, setApplicationId] = useState('');
  const [typeId, setTypeId] = useState('');

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global, project, application: applicationI18n } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (application?.id) setApplicationId(application.id);
  }, [application?.id]);

  useEffect(() => {
    if (organizationId && applicationId) {
      fetchProjectList({
        organizationId,
        applicationId,
        page: pageInfo.page,
        size: pageInfo.size,
      });
    }
  }, [fetchProjectList, organizationId, applicationId]);

  // get select project detail info
  useEffect(() => {
    const newTypeId = editProject?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editProject]);

  // fetch project selected auth list
  useEffect(() => {
    if (visible && applicationId && typeId) {
      fetchAuthList({
        applicationId,
        type: 'folder',
        typeId,
      });
    }
  }, [visible, applicationId, typeId, fetchAuthList]);

  // fetch project selected authorize user available list
  useEffect(() => {
    if (visible) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [visible, fetchUserList]);

  const handleOnSaveSuccess = () => {
    if (organizationId && applicationId) {
      fetchProjectList({
        organizationId,
        applicationId,
        page: pageInfo.page,
        size: pageInfo.size,
      });
    }
  };

  return (
    <FoxpageDetailContent
      breadcrumb={
        <FoxpageBreadcrumb
          breadCrumb={[
            { name: applicationI18n.applicationList, link: '/#/workspace/application' },
            { name: global.projects },
          ]}
        />
      }>
      <React.Fragment>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={() => openDrawer(true)}>
            <PlusOutlined /> {project.add}
          </Button>
        </div>
        <List />
        <EditDrawer onSaveSuccess={handleOnSaveSuccess} />
        <AuthorizeDrawer
          type="folder"
          typeId={typeId}
          applicationId={applicationId}
          visible={visible}
          loading={authLoading}
          list={authList}
          users={userList}
          onClose={openAuthDrawer}
          onFetch={fetchAuthList}
          onAdd={addUser}
          onDelete={deleteUser}
        />
      </React.Fragment>
    </FoxpageDetailContent>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
