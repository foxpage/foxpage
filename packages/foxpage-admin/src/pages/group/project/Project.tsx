import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/list';

import EditDrawer from './drawer/EditDrawer';
import List from './List';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.project.list.loading,
  pageInfo: store.group.project.list.pageInfo,
});

const mapDispatchToProps = {
  openDrawer: ACTIONS.setAddDrawerOpenStatus,
  fetchProjectList: ACTIONS.fetchProjectList,
  clearAll: ACTIONS.clearAll,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = props => {
  const { pageInfo = { page: 1, size: 10 }, fetchProjectList, openDrawer, clearAll } = props;

  useEffect(() => {
    fetchProjectList({ page: pageInfo.page, size: pageInfo.size });
    return () => {
      clearAll();
    };
  }, []);
  return (
    <React.Fragment>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={openDrawer}>
          <PlusOutlined /> Add Project
        </Button>
      </div>
      <List />
      <EditDrawer />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
