import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { WIDTH_DEFAULT } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import { TeamEntity } from '@/types/team';
import { periodFormat } from '@/utils/period-format';

import EditDrawer from './components/EditDrawer';
import MemberManagement from './components/MemberManagement';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 36px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.user.organizationId,
  fetching: store.teams.list.fetching,
  list: store.teams.list.list,
  pageInfo: store.teams.list.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTeamList: ACTIONS.fetchTeamList,
  deleteTeam: ACTIONS.deleteTeam,
  openDrawer: ACTIONS.openDrawer,
  openUserManagementDrawer: ACTIONS.openUserManagementDrawer,
};

type TeamListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TeamListType> = (props) => {
  const {
    organizationId,
    fetching,
    list,
    pageInfo,
    fetchTeamList,
    deleteTeam,
    openDrawer,
    openUserManagementDrawer,
    clearAll,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, team } = locale.business;

  // go back to login page if organization id undefined
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

  const columns: any = [
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
      width: 130,
      render: (_text: string, record: TeamEntity) => (
        <React.Fragment>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={team.userManagement}
            onClick={() => openUserManagementDrawer(true, record)}>
            <TeamOutlined />
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
            title={`${global.deleteMsg} ${record.name}?`}
            onConfirm={() => {
              deleteTeam(organizationId, record);
            }}
            okText={global.yes}
            cancelText={global.no}>
            <Button size="small" shape="circle" icon={<DeleteOutlined />} style={{ marginLeft: 8 }} />
          </Popconfirm>
        </React.Fragment>
      ),
    },
  ];

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: global.team,
                },
              ]}
            />
          }
          style={{ maxWidth: WIDTH_DEFAULT, margin: '0 auto', overflow: 'unset' }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              onClick={() => {
                openDrawer(true);
              }}>
              <PlusOutlined /> {team.add}
            </Button>
          </div>
          <Table
            rowKey="id"
            loading={fetching}
            columns={columns}
            dataSource={list}
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
              fetchTeamList({
                organizationId,
                page: pagination.current || 1,
                size: pagination.pageSize || 10,
              });
            }}
          />
        </FoxPageContent>
      </Content>
      <EditDrawer />
      <MemberManagement organizationId={organizationId} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
