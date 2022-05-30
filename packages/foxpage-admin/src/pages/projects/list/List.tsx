import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { BuildOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Spin, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/list';
import { DeleteButton } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectType } from '@/types/project';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  loading: store.projects.list.loading,
  pageInfo: store.projects.list.pageInfo,
  projectList: store.projects.list.projectList,
});

const mapDispatchToProps = {
  openDrawer: ACTIONS.setAddDrawerOpenStatus,
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
            to={`/projects/detail?applicationId=${record.application.id}&folderId=${record.id}`}>
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
      key: 'updateTime',
      width: 130,
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
                deleteProject(record.id, record.application.id, organizationId);
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
          </React.Fragment>
        );
      },
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
            organizationId,
            page: pagination.current || 1,
            size: pagination.pageSize || 10,
          });
        }}
      />
    </Spin>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
