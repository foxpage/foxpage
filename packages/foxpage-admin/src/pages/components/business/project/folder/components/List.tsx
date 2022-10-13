import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { FolderOutlined } from '@ant-design/icons';
import { Spin, Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';

import { Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { PaginationInfo, ProjectEntity, ProjectListFetchParams } from '@/types/index';
import { periodFormat } from '@/utils/index';

interface ProjectListProp {
  organizationId: string;
  applicationId?: string;
  search?: string;
  searchCache?: Record<string, string | undefined>;
  type: string;
  loading: boolean;
  pageInfo: PaginationInfo;
  projectList: ProjectEntity[];
  fetchProjectList: (params: ProjectListFetchParams) => void;
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
    searchCache,
    type,
    loading,
    pageInfo,
    projectList,
    fetchProjectList,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

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
  ];

  // if (authorizeAdmin) {
  //   columns.push({
  //     title: global.actions,
  //     key: '',
  //     width: 130,
  //     render: (_text: string, record: ProjectEntity) => (
  //       <>
  //         <Button
  //           type="default"
  //           size="small"
  //           shape="circle"
  //           title={global.edit}
  //           onClick={() => openDrawer(true, record)}
  //         >
  //           <EditOutlined />
  //         </Button>
  //         <Popconfirm
  //           cancelText={global.no}
  //           okText={global.yes}
  //           title={project.deleteMessage}
  //           onConfirm={() => {
  //             deleteProject(record.id, record.application.id, organizationId, searchAppId);
  //           }}>
  //           <DeleteButton
  //             type="default"
  //             size="small"
  //             shape="circle"
  //             title={global.remove}
  //             style={{ marginLeft: 8 }}
  //           />
  //         </Popconfirm>
  //         <Button
  //           type="default"
  //           size="small"
  //           shape="circle"
  //           title={global.userPermission}
  //           onClick={() => handeAuthorize(true, record)}>
  //           <UserOutlined />
  //         </Button>
  //       </>
  //     ),
  //   });
  // }

  // remove column application in application detail
  if (type === 'application') {
    columns.splice(2, 1);
  }

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
        onChange={(pagination) => {
          fetchProjectList({
            applicationId,
            organizationId,
            page: pagination.current || 1,
            size: pagination.pageSize || 10,
            search: searchAppId,
            searchText: searchCache?.searchText || '',
            searchType: searchCache?.searchType || '',
          });
        }}
      />
    </Spin>
  );
};

export default ProjectList;
