import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/team';
import { OrganizationUrlParams, Team } from '@/types/index';
import periodFormat from '@/utils/period-format';

import EditDrawer from './EditDrawer';
import MemberManagement from './MemberManagement';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.team.fetching,
  list: store.group.team.list,
  pageInfo: store.group.team.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTeamList: ACTIONS.fetchTeamList,
  openDrawer: ACTIONS.openDrawer,
  deleteTeam: ACTIONS.deleteTeam,
  updateUserManagementDrawerOpenStatus: ACTIONS.updateUserManagementDrawerOpenStatus,
};

type TeamListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TeamListType> = props => {
  const {
    loading,
    list,
    pageInfo,
    fetchTeamList,
    openDrawer,
    deleteTeam,
    updateUserManagementDrawerOpenStatus,
    clearAll,
  } = props;
  const { organizationId } = useParams<OrganizationUrlParams>();

  useEffect(() => {
    fetchTeamList({ organizationId, page: pageInfo.page, size: pageInfo.size });
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
      title: 'User Count',
      dataIndex: 'memberCount',
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: 'Actions',
      dataIndex: 'updateTime',
      width: 160,
      render: (_text: string, record: Team) => {
        return (
          <React.Fragment>
            <Button
              type="default"
              size="small"
              shape="circle"
              title="Edit"
              onClick={() => updateUserManagementDrawerOpenStatus(true, record)}
            >
              <TeamOutlined />
            </Button>
            <Divider type="vertical" />
            <Button type="default" size="small" shape="circle" title="Edit" onClick={() => openDrawer(record)}>
              <EditOutlined />
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure to delete this project?"
              onConfirm={() => {
                deleteTeam(record);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          onClick={() => {
            openDrawer();
          }}
        >
          <PlusOutlined /> Add Team
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={list}
        columns={columns}
        pagination={
          pageInfo.total > pageInfo.size
            ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
            : false
        }
        onChange={pagination => {
          fetchTeamList({ organizationId, page: pagination.current || 1, size: pagination.pageSize || 10 });
        }}
      />
      <EditDrawer />
      <MemberManagement />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
