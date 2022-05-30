import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/recycleBin/recycleBin';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectType } from '@/types/index';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  loading: store.workspace.projects.recycleBin.loading,
  pageInfo: store.workspace.projects.recycleBin.pageInfo,
  projects: store.workspace.projects.recycleBin.projects,
});

const mapDispatchToProps = {
  searchRecycles: ACTIONS.searchRecycles,
  clearAll: ACTIONS.clearAll,
};

type ProjectsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const RecycleBin: React.FC<ProjectsProps> = (props) => {
  const { organizationId, loading, pageInfo, projects, searchRecycles, clearAll } = props;

  const { locale } = useContext(GlobalContext);
  const { global, project } = locale.business;

  useEffect(() => {
    searchRecycles({ organizationId, page: pageInfo.page, size: pageInfo.size, search: '' });

    return () => {
      clearAll();
    };
  }, []);

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
    },
    {
      title: global.application,
      dataIndex: 'application',
      render: (_text: string, record: ProjectType) => {
        return record.application.name;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      render: (_text: string, record: ProjectType) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
  ];

  return (
    <FoxpageDetailContent
      breadcrumb={
        <FoxpageBreadcrumb breadCrumb={[{ name: project.recycleBin, link: '/#/workspace/dynamic' }]} />
      }>
      <Table
        loading={loading}
        rowKey="id"
        dataSource={projects}
        columns={columns}
        pagination={
          pageInfo.total > pageInfo.size
            ? {
                position: ['bottomCenter'],
                current: pageInfo.page,
                pageSize: pageInfo.size,
                total: pageInfo.total,
              }
            : false
        }
        onChange={(pagination) => {
          searchRecycles({ organizationId, page: pagination.current, size: pagination.pageSize, search: '' });
        }}
      />
    </FoxpageDetailContent>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecycleBin);
