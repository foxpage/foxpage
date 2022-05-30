import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import { Pagination } from '@/pages/common';
import { AuthorizeDrawer } from '@/pages/components';
import OperationDrawer from '@/pages/components/business/OperationDrawer';
import GlobalContext from '@/pages/GlobalContext';

import ActionBar from './ActionBar';
import EditPanel from './EditPanel';
import ListView from './ListView';

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const Root = styled.div`
  flex-grow: 1;
  height: 100%;
`;

const mapStateToProps = (state: RootState) => ({
  organizationId: state.system.organizationId,
  pageInfo: state.group.application.list.pageInfo,
  editDrawerVisible: state.group.application.list.editDrawerVisible,
  editApp: state.group.application.list.editApp,
  authDrawerVisible: state.group.application.list.authListDrawerVisible,
  authLoading: state.group.application.list.authListLoading,
  authList: state.group.application.list.authList,
  userList: state.group.application.list.userList,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  changePageNum: ACTIONS.changePageNum,
  saveApp: ACTIONS.saveApp,
  updateDrawerVisible: ACTIONS.updateDrawerVisible,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  addUser: ACTIONS.authAddUser,
  deleteUser: ACTIONS.authDeleteUser,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function Main(props: IProps) {
  const {
    organizationId,
    pageInfo,
    editDrawerVisible,
    editApp,
    authDrawerVisible,
    authLoading,
    authList,
    userList,
    fetchList,
    changePageNum,
    updateDrawerVisible,
    saveApp,
    openAuthDrawer,
    fetchAuthList,
    fetchUserList,
    addUser,
    deleteUser,
  } = props;
  const { page = 1, size = 1, total = 0 } = pageInfo;
  const [typeId, setTypeId] = useState('');

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { application, global } = locale.business;

  useEffect(() => {
    fetchList({ search: '', page, size, organizationId, type: 'user' });
  }, [fetchList, organizationId]);

  useEffect(() => {
    const newTypeId = editApp?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editApp]);

  // fetch project selected auth list
  useEffect(() => {
    if (authDrawerVisible && typeId) {
      fetchAuthList({
        applicationId: typeId,
        type: 'application',
        typeId,
      });
    }
  }, [authDrawerVisible, typeId, fetchAuthList]);

  // fetch project selected authorize user available list
  useEffect(() => {
    if (authDrawerVisible) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [authDrawerVisible, fetchUserList]);

  const handleSetPageNo = (pageNo: number) => {
    changePageNum(pageNo);
    fetchList({ page: pageNo, search: '', size, organizationId });
  };

  return (
    <Root>
      <ActionBar />
      <ListView />
      <Pagination current={page} onChange={handleSetPageNo} pageSize={size} total={total} />
      <OperationDrawer
        open={editDrawerVisible}
        width={480}
        title={editApp.id ? application.edit : application.add}
        onClose={() => updateDrawerVisible(false)}
        actions={
          <Button type="primary" onClick={() => saveApp()}>
            {global.apply}
          </Button>
        }>
        <EditPanel />
      </OperationDrawer>
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
        onAdd={addUser}
        onDelete={deleteUser}
      />
    </Root>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
