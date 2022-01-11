import React from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { BuildOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/list';
import { DeleteButton } from '@/pages/common';
import { ProjectType } from '@/types/project';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.project.list.loading,
  pageInfo: store.group.project.list.pageInfo,
  projectList: store.group.project.list.projectList,
});

const mapDispatchToProps = {
  openDrawer: ACTIONS.setAddDrawerOpenStatus,
  fetchProjectList: ACTIONS.fetchProjectList,
  deleteProject: ACTIONS.deleteProject,
};

type ProjectListProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ProjectList: React.FC<ProjectListProp> = props => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const {
    loading,
    pageInfo = { page: 1, size: 10, total: 1 },
    projectList = [],
    fetchProjectList,
    openDrawer,
    deleteProject,
  } = props;

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      render: (_text: string, record: ProjectType) => {
        return (
          <Link
            onClick={() => {
              localStorage['foxpage_project_folder'] = JSON.stringify(record);
            }}
            to={`/organization/${organizationId}/project/${record.application.id}/folder/${record.id}`}
          >
            {record.name}
          </Link>
        );
      },
    },
    {
      title: 'Application',
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
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ProjectType) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: 'Actions',
      key: 'updateTime',
      width: 130,
      render: (_text: string, record: ProjectType) => {
        return (
          <React.Fragment>
            <Button type="default" size="small" shape="circle" title="build">
              <Link
                to={`/application/${record.application.id}/folder/${record.id}/builder`}
                onClick={() => {
                  localStorage['foxpage_project_file'] = JSON.stringify(record);
                }}
              >
                <BuildOutlined />
              </Link>
            </Button>
            <Button
              type="default"
              size="small"
              shape="circle"
              title="Edit"
              onClick={() => openDrawer(true, record)}
              style={{ marginLeft: 8 }}
            >
              <EditOutlined />
            </Button>
            <Popconfirm
              title="Are you sure to delete this project?"
              onConfirm={() => {
                deleteProject(record.id, record.application.id);
              }}
              okText="Yes"
              cancelText="No"
            >
              <DeleteButton type="default" size="small" shape="circle" title="Remove" style={{ marginLeft: 8 }} />
            </Popconfirm>
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
      onChange={pagination => {
        fetchProjectList({ page: pagination.current || 1, size: pagination.pageSize || 10 });
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
