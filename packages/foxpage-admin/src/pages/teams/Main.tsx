import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Table as AntTable } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { WIDTH_DEFAULT } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import { TeamEntity } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

import EditDrawer from './components/EditDrawer';
import MemberManagement from './components/MemberManagement';

const { Search } = Input;

const PAGE_NUM = 1;

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 36px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
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
    fetching,
    list,
    pageInfo,
    fetchTeamList,
    deleteTeam,
    openDrawer,
    openUserManagementDrawer,
    clearAll,
  } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);
  const [search, setSearch] = useState<string | undefined>();

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
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
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (organizationId) {
      fetchTeamList({
        organizationId,
        page: pageNum,
        size: pageInfo.size,
        search: search || '',
      });
    }
  }, [fetchTeamList, organizationId, pageNum, search]);

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
    },
    {
      title: team.userCount,
      dataIndex: 'memberCount',
      width: 150,
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

  const handleSearch = (search) => {
    setPageNum(PAGE_NUM);

    setSearch(search);
  };

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
            <Search
              placeholder={global.inputSearchText}
              defaultValue={search}
              onSearch={handleSearch}
              style={{ width: 250, marginRight: 12 }}
            />
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
                search: search || '',
              });
            }}
          />
        </FoxPageContent>
      </Content>
      <EditDrawer />
      <MemberManagement />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
