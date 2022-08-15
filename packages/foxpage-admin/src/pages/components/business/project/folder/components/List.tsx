import React, { useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BuildOutlined, EditOutlined, FolderOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Spin, Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';

import { DeleteButton, Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { PaginationInfo, ProjectEntity, ProjectListFetchParams } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

interface ProjectListProp {
  organizationId: string;
  applicationId?: string;
  search?: string;
  type: string;
  loading: boolean;
  pageInfo: PaginationInfo;
  projectList: ProjectEntity[];
  fetchProjectList: (params: ProjectListFetchParams) => void;
  deleteProject: (id: string, applicationId: string, organizationId: string, search?: string) => void;
  openDrawer: (open: boolean, editProject?: ProjectEntity) => void;
  openAuthDrawer?: (visible: boolean, editProject?: ProjectEntity) => void;
}

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const ProjectList: React.FC<ProjectListProp> = (props: ProjectListProp) => {
  const {
    applicationId,
    organizationId,
    search: searchAppId,
    type,
    loading,
    pageInfo,
    projectList,
    fetchProjectList,
    deleteProject,
    openDrawer,
    openAuthDrawer,
  } = props;

  // url search params
  const { pathname, search } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { project, global } = locale.business;

  const handeAuthorize = (open: boolean, project: ProjectEntity) => {
    if (typeof openAuthDrawer === 'function') {
      openAuthDrawer(open, project);
    }
  };

  const authorizeAdmin = useMemo(() => type === 'personal' || type === 'application', [type]);

  const columns: any = [
    {
      title: '',
      dataIndex: '',
      width: 40,
      render: () => <FolderOutlined style={{ color: '#FF9900' }} />,
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: ProjectEntity) => {
        const slugMap = {
          application: `/applications/${record.application.id}/projects`,
          involved: '/workspace/projects/involved',
          personal: '/workspace/projects/personal',
          projects: '/projects',
        };

        return (
          <Link
            onClick={() => {
              localStorage['foxpage_project_folder'] = JSON.stringify(record);
            }}
            to={`${slugMap[type]}/detail?applicationId=${record.application.id}&folderId=${record.id}`}>
            <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
              <Name>{text}</Name>
            </Tooltip>
          </Link>
        );
      },
    },
    {
      title: global.application,
      dataIndex: 'application',
      key: 'application',
      width: 200,
      render: (_text: string, record: ProjectEntity) => {
        return (
          <Link to={`/applications/${record.application.id}/file/pages/list`}>{record.application.name}</Link>
        );
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 150,
      render: (_text: string, record: ProjectEntity) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: '',
      width: authorizeAdmin ? 160 : 80,
      render: (_text: string, record: ProjectEntity) => (
        <>
          <Button type="default" size="small" shape="circle" title={global.build}>
            <Link
              to={{
                pathname: '/builder',
                search: `?applicationId=${record.application.id}&folderId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}
              onClick={() => {
                localStorage['foxpage_project_file'] = JSON.stringify(record);
              }}>
              <BuildOutlined />
            </Link>
          </Button>
          {authorizeAdmin && (
            <>
              <Button
                type="default"
                size="small"
                shape="circle"
                title={global.edit}
                onClick={() => openDrawer(true, record)}
                style={{ marginLeft: 8 }}>
                <EditOutlined />
              </Button>
              <Popconfirm
                cancelText={global.no}
                okText={global.yes}
                title={project.deleteMessage}
                onConfirm={() => {
                  deleteProject(record.id, record.application.id, organizationId, searchAppId);
                }}>
                <DeleteButton
                  type="default"
                  size="small"
                  shape="circle"
                  title={global.remove}
                  style={{ marginLeft: 8 }}
                />
              </Popconfirm>
              <Button
                type="default"
                size="small"
                shape="circle"
                title={global.userPermission}
                onClick={() => handeAuthorize(true, record)}>
                <UserOutlined />
              </Button>
            </>
          )}
        </>
      ),
    },
  ];

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
              }
            : false
        }
        onChange={(pagination) => {
          fetchProjectList({
            applicationId,
            organizationId,
            page: pagination.current || 1,
            size: pagination.pageSize || 10,
            search: searchAppId,
          });
        }}
      />
    </Spin>
  );
};

export default ProjectList;
