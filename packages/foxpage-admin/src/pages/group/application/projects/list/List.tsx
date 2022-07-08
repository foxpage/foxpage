import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { BuildOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/list';
import { DeleteButton } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectType } from '@/types/project';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  loading: store.workspace.projects.project.list.loading,
  pageInfo: store.workspace.projects.project.list.pageInfo,
  projectList: store.workspace.projects.project.list.projectList,
});

const mapDispatchToProps = {
  openDrawer: ACTIONS.setAddDrawerOpenStatus,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchProjectList: ACTIONS.fetchProjectList,
  deleteProject: ACTIONS.deleteProject,
};

type ProjectListProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ProjectList: React.FC<ProjectListProp> = (props) => {
  const {
    organizationId,
    loading,
    pageInfo = { page: 1, size: 10, total: 1 },
    projectList = [],
    fetchProjectList,
    openDrawer,
    openAuthDrawer,
    deleteProject,
  } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { project, global } = locale.business;

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (_text: string, record: ProjectType) => {
        return (
          <Link
            onClick={() => {
              localStorage['foxpage_project_folder'] = JSON.stringify(record);
            }}
            to={`/organization/${organizationId}/application/${record.application.id}/detail/projects/detail?applicationId=${record.application.id}&folderId=${record.id}`}>
            {record.name}
          </Link>
        );
      },
    },
    {
      title: global.application,
      dataIndex: 'application',
      key: 'application',
      render: (_text: string, record: ProjectType) => {
        return (
          <Link to={`/organization/${organizationId}/application/${record.application.id}/detail/`}>
            {record.application.name}
          </Link>
        );
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ProjectType) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: '',
      width: 160,
      render: (_text: string, record: ProjectType) => {
        return (
          <React.Fragment>
            <Button type="default" size="small" shape="circle" title={global.build}>
              <Link
                to={{
                  pathname: `/application/${record.application.id}/folder/${record.id}/builder`,
                }}
                onClick={() => {
                  localStorage['foxpage_project_file'] = JSON.stringify(record);
                }}>
                <BuildOutlined />
              </Link>
            </Button>
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
              title={project.deleteMessage}
              onConfirm={() => {
                deleteProject(record.id, record.application.id, organizationId, 'app');
              }}
              okText={global.yes}
              cancelText={global.no}>
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
              onClick={() => openAuthDrawer(true, record)}>
              <UserOutlined />
            </Button>
          </React.Fragment>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
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
          organizationId,
          page: pagination.current || 1,
          size: pagination.pageSize || 10,
          type: 'user',
        });
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
