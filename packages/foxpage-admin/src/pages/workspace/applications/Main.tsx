import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { AuthorizeDrawer, Content, FoxPageBreadcrumb, FoxPageContent } from '@/pages/components';
import { GlobalContext } from '@/pages/system';

import { EditDrawer, List } from './components';

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const mapStateToProps = (state: RootState) => ({
  organizationId: state.system.user.organizationId,
  pageInfo: state.workspace.applications.list.pageInfo,
  drawerVisible: state.workspace.applications.list.editDrawerVisible,
  editApp: state.workspace.applications.list.editApp,
  authDrawerVisible: state.workspace.applications.list.authListDrawerVisible,
  authLoading: state.workspace.applications.list.authListLoading,
  authList: state.workspace.applications.list.authList,
  userList: state.workspace.applications.list.userList,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  saveApp: ACTIONS.saveApp,
  openDrawer: ACTIONS.openEditDrawer,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function Application(props: IProps) {
  const {
    organizationId,
    pageInfo,
    editApp,
    authDrawerVisible,
    authLoading,
    authList,
    userList,
    fetchList,
    openDrawer,
    openAuthDrawer,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
  } = props;
  const [typeId, setTypeId] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { application } = locale.business;

  useEffect(() => {
    fetchList({ organizationId, type: 'user', page: pageInfo.page, size: pageInfo.size });
  }, [fetchList, organizationId]);

  useEffect(() => {
    const newTypeId = editApp?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editApp]);

  // fetch application selected auth list
  useEffect(() => {
    if (authDrawerVisible && typeId) {
      fetchAuthList({
        applicationId: typeId,
        type: 'application',
        typeId,
      });
    }
  }, [authDrawerVisible, typeId, fetchAuthList]);

  // fetch application selected authorize user available list
  useEffect(() => {
    if (authDrawerVisible) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [authDrawerVisible, fetchUserList]);

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: application.name,
                },
              ]}
            />
          }>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={() => openDrawer(true)}>
              <PlusOutlined /> {application.add}
            </Button>
          </div>
          <List />
        </FoxPageContent>
      </Content>
      <EditDrawer />
      <AuthorizeDrawer
        type="application"
        typeId={typeId}
        applicationId={typeId}
        visible={authDrawerVisible}
        loading={authLoading}
        list={authList}
        users={userList}
        onClose={openAuthDrawer}
        onFetch={fetchAuthList}
        onAdd={saveUser}
        onDelete={deleteUser}
      />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Application);
