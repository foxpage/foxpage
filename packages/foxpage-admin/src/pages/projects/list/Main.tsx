import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/list';
import { Content, StyledLayout } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';

import EditDrawer from '../drawer/EditDrawer';

import List from './List';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  loading: store.projects.list.loading,
  pageInfo: store.projects.list.pageInfo,
});

const mapDispatchToProps = {
  openDrawer: ACTIONS.setAddDrawerOpenStatus,
  fetchProjectList: ACTIONS.fetchProjectList,
  clearAll: ACTIONS.clearAll,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Project: React.FC<ProjectProps> = (props) => {
  const { organizationId, pageInfo = { page: 1, size: 10 }, fetchProjectList, openDrawer, clearAll } = props;

  const { locale } = useContext(GlobalContext);
  const { project } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (organizationId) fetchProjectList({ organizationId, page: pageInfo.page, size: pageInfo.size });
  }, [fetchProjectList, organizationId]);

  return (
    <StyledLayout>
      <Content>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={() => openDrawer(true)}>
            <PlusOutlined /> {project.add}
          </Button>
        </div>
        <List />
      </Content>
      <EditDrawer />
    </StyledLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
