import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { Table as AntTable } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/recycleBin';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.user.organizationId,
  loading: store.workspace.projects.recycleBin.loading,
  pageInfo: store.workspace.projects.recycleBin.pageInfo,
  projects: store.workspace.projects.recycleBin.projects,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchRecycles: ACTIONS.fetchRecycle,
};

type ProjectsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const RecycleBin: React.FC<ProjectsProps> = (props) => {
  const { organizationId, loading, pageInfo, projects, fetchRecycles, clearAll } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  useEffect(() => {
    fetchRecycles({ organizationId, page: pageInfo.page, size: pageInfo.size, search: '' });

    return () => {
      clearAll();
    };
  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'id',
      width: 40,
      render: (id: string) => {
        const iconMap = {
          folder: <FolderOutlined style={{ color: '#ff9900' }} />,
          file: <FileOutlined />,
          default: '',
        };

        const folderIdStart = 'fold_';
        const fileIdStart = 'file_';
        const type = id.includes(folderIdStart) ? 'folder' : id.includes(fileIdStart) ? 'file' : 'default';

        return <span>{iconMap[type]}</span>;
      },
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
    },
    {
      title: global.application,
      dataIndex: 'application',
      render: (application) => application.name,
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      render: (creator) => creator?.account || '--',
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      width: 200,
      render: (createTime) => periodFormat(createTime, 'unknown'),
    },
  ];

  return (
    <FoxPageContent
      breadcrumb={
        <FoxPageBreadcrumb
          breadCrumb={[
            {
              name: global.recycles,
            },
          ]}
        />
      }>
      <Content>
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
            fetchRecycles({
              organizationId,
              page: pagination.current,
              size: pagination.pageSize,
              search: '',
            });
          }}
        />
      </Content>
    </FoxPageContent>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecycleBin);
