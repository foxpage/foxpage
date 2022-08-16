import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { Application } from '@/types/application';
import { periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (state: RootState) => ({
  organizationId: state.system.user.organizationId,
  loading: state.workspace.applications.list.loading,
  pageInfo: state.workspace.applications.list.pageInfo,
  list: state.workspace.applications.list.applicationList,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  openDrawer: ACTIONS.openEditDrawer,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
};

type ApplicationListProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ApplicationList = (props: ApplicationListProps) => {
  const { organizationId, loading, pageInfo, list, fetchList, openDrawer, openAuthDrawer } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const handleEdit = (app) => {
    openDrawer(true, app);
  };

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, app: Application) => (
        <Link to={`/applications/${app.id}/file/pages/list`}>
          <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
            <Name style={{ maxWidth: 400 }}>{text}</Name>
          </Tooltip>
        </Link>
      ),
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      render: (_text: string, record: Application) => {
        return record.creator?.account || '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      dataIndex: '',
      width: 100,
      render: (_text: string, record: Application) => {
        return (
          <>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={global.edit}
              onClick={() => {
                handleEdit(record);
              }}>
              <EditOutlined />
            </Button>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={global.userPermission}
              onClick={() => openAuthDrawer(true, record)}
              style={{ marginLeft: 8 }}>
              <UserOutlined />
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Table
        rowKey="id"
        loading={loading}
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
          fetchList({
            page: pagination.current,
            search: '',
            size: pagination.pageSize,
            organizationId,
            type: 'user',
          });
        }}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationList);
