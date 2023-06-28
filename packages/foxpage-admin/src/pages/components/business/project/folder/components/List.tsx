import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { FolderOutlined } from '@ant-design/icons';
import { Spin, Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';

import { Name } from '@/components/index';
import { GlobalTypeColor, ROUTE_FILE_MAP } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { PaginationInfo, ProjectEntity } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

interface ProjectListProp {
  applicationId?: string;
  search?: string;
  type: string;
  loading: boolean;
  pageInfo: PaginationInfo;
  projectList: ProjectEntity[];
}

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const ProjectList: React.FC<ProjectListProp> = (props: ProjectListProp) => {
  const { applicationId, search: searchAppId, type, loading, pageInfo, projectList } = props;

  // url params
  const history = useHistory();
  const { appId: folderSearch, page: folderPage } = getLocationIfo(history.location);

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global } = locale.business;

  const columns: any = [
    {
      title: '',
      dataIndex: '',
      width: 40,
      render: () => <FolderOutlined style={{ color: GlobalTypeColor.project }} />,
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: ProjectEntity) => (
        <Link
          onClick={() => {
            localStorage['foxpage_project_folder'] = JSON.stringify(record);
          }}
          to={{
            pathname: `${ROUTE_FILE_MAP[type].replace(':applicationId', applicationId)}`,
            search: `?applicationId=${record.application.id}&folderId=${record.id}&folderPage=${
              folderPage || ''
            }&folderSearch=${folderSearch || ''}`,
          }}>
          <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
            <Name>{text}</Name>
          </Tooltip>
        </Link>
      ),
    },
    {
      title: global.application,
      dataIndex: 'application',
      key: 'application',
      width: 220,
      render: (_text: string, record: ProjectEntity) => {
        const projectOrgId = record?.organization?.id;

        return organizationId === projectOrgId ? (
          <>
            <Link to={`/applications/${record.application.id}/`}>{record.application.name}</Link>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{record?.organization?.name || ''}</p>
          </>
        ) : (
          <>
            <p>{record.application.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{record?.organization?.name || ''}</p>
          </>
        );
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (_text: string, record: ProjectEntity) => {
        return record.creator ? record.creator?.email : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
  ];

  // remove column application in application detail
  if (type === 'application') {
    columns.splice(2, 1);
  }

  const handlePaginationChange = (pagination) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${pagination?.current || 1}&appId=${searchAppId}`,
    });
  };

  return (
    <Spin spinning={loading}>
      <Table
        rowKey="id"
        dataSource={projectList}
        columns={columns}
        pagination={
          pageInfo.total > pageInfo.size
            ? {
                position: ['bottomCenter'],
                current: pageInfo.page,
                pageSize: pageInfo.size,
                total: pageInfo.total,
                showSizeChanger: false,
              }
            : false
        }
        onChange={handlePaginationChange}
      />
    </Spin>
  );
};

export default ProjectList;
