import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Spin, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import { Content, StyledLayout } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';
import { Team } from '@/types/team';
import periodFormat from '@/utils/period-format';

import EditDrawer from './components/EditDrawer';
import MemberManagement from './components/MemberManagement';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  fetching: store.teams.list.fetching,
  list: store.teams.list.list,
  pageInfo: store.teams.list.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTeamList: ACTIONS.fetchTeamList,
  openDrawer: ACTIONS.openDrawer,
  deleteTeam: ACTIONS.deleteTeam,
  updateUserManagementDrawerOpenStatus: ACTIONS.updateUserManagementDrawerOpenStatus,
};

type TeamListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TeamListType> = (props) => {
  const {
    organizationId,
    fetching,
    list,
    pageInfo,
    fetchTeamList,
    openDrawer,
    deleteTeam,
    updateUserManagementDrawerOpenStatus,
    clearAll,
  } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global, team } = locale.business;

  const history = useHistory();

  if (!organizationId) {
    history.push({
      pathname: '/login',
    });
    return null;
  }

  useEffect(() => {
    if (organizationId) {
      fetchTeamList({ organizationId, page: pageInfo.page, size: pageInfo.size });
    }

    return () => {
      clearAll();
    };
  }, [fetchTeamList, organizationId]);

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
    },
    {
      title: team.userCount,
      dataIndex: 'memberCount',
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      dataIndex: 'updateTime',
      width: 160,
      render: (_text: string, record: Team) => {
        return (
          <React.Fragment>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={team.userManagement}
              onClick={() => updateUserManagementDrawerOpenStatus(true, record)}>
              <TeamOutlined />
            </Button>
            <Divider type="vertical" />
            <Button
              type="default"
              size="small"
              shape="circle"
              title={global.edit}
              onClick={() => openDrawer(record)}>
              <EditOutlined />
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title={`${global.deleteMsg} ${record.name}?`}
              onConfirm={() => {
                deleteTeam(organizationId, record);
              }}
              okText={global.yes}
              cancelText={global.no}>
              <Button size="small" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];

  return (
    <Spin spinning={fetching}>
      <StyledLayout>
        <Content>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              onClick={() => {
                openDrawer();
              }}>
              <PlusOutlined /> {team.add}
            </Button>
          </div>
          <Table
            rowKey="id"
            dataSource={list}
            columns={columns}
            pagination={
              pageInfo.total > pageInfo.size
                ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
                : false
            }
            onChange={(pagination) => {
              fetchTeamList({
                organizationId,
                page: pagination.current || 1,
                size: pagination.pageSize || 10,
              });
            }}
          />
        </Content>
      </StyledLayout>
      <EditDrawer organizationId={organizationId} />
      <MemberManagement organizationId={organizationId} />
    </Spin>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
