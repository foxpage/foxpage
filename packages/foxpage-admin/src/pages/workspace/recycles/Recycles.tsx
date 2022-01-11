import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/recycles';
import { ProjectType } from '@/types/index';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.recycles.loading,
  pageInfo: store.workspace.recycles.pageInfo,
  projects: store.workspace.recycles.projects,
});

const mapDispatchToProps = {
  searchRecycles: ACTIONS.searchRecycles,
  clearAll: ACTIONS.clearAll,
};

type ProjectsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Projects: React.FC<ProjectsProps> = props => {
  const { loading, pageInfo, projects, searchRecycles, clearAll } = props;

  useEffect(() => {
    searchRecycles({ page: pageInfo.page, size: pageInfo.size, search: '' });
    return () => {
      clearAll();
    };
  }, []);
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Application',
      dataIndex: 'application',
      render: (_text: string, record: ProjectType) => {
        return record.application.name;
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      render: (_text: string, record: ProjectType) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
  ];

  return (
    <Table
      loading={loading}
      rowKey="id"
      dataSource={projects}
      columns={columns}
      style={{ marginTop: 44 }}
      pagination={
        pageInfo.total > pageInfo.size
          ? { position: ['bottomCenter'], current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
          : false
      }
      onChange={pagination => {
        searchRecycles({ page: pagination.current, size: pagination.pageSize, search: '' });
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
