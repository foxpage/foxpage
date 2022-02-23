import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { Button } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import { Pagination } from '@/pages/common';
import OperationDrawer from '@/pages/components/business/OperationDrawer';
import GlobalContext from '@/pages/GlobalContext';
import { getLoginUser } from '@/utils/login-user';

import ActionBar from './ActionBar';
import EditPanel from './EditPanel';
import ListView from './ListView';

const Root = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  height: 100%;
`;

const mapStateToProps = (state: RootState) => ({
  list: state.group.application.list.list,
  pageInfo: state.group.application.list.pageInfo,
  editApp: state.group.application.list.editApp,
  editDrawerVisible: state.group.application.list.editDrawerVisible,
  fetching: state.group.application.list.fetching,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  clearAll: ACTIONS.clearAll,
  changePageNum: ACTIONS.changePageNum,
  saveApp: ACTIONS.saveApp,
  updateDrawerVisible: ACTIONS.updateDrawerVisible,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function Main(props: IProps) {
  const { fetchList, changePageNum, editApp, updateDrawerVisible, editDrawerVisible, pageInfo, saveApp } = props;
  const { page = 1, size = 1, total = 0 } = pageInfo;
  const { organizationId } = getLoginUser();

  const { locale } = useContext(GlobalContext);
  const { application, global } = locale.business;

  useEffect(() => {
    fetchList({ page: 1, search: '', size, organizationId });
  }, []);

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
        title={editApp.id ? application.edit : application.add}
        onClose={() => updateDrawerVisible(false)}
        actions={
          <Button type="primary" onClick={() => saveApp()}>
            {global.apply}
          </Button>
        }
      >
        <EditPanel />
      </OperationDrawer>
    </Root>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
