import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { DeleteButton, Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { Application } from '@/types/index';
import { periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (state: RootState) => ({
  loading: state.workspace.applications.list.loading,
  pageInfo: state.workspace.applications.list.pageInfo,
  list: state.workspace.applications.list.applicationList,
});

const mapDispatchToProps = {
  deleteApp: ACTIONS.deleteApp,
  fetchList: ACTIONS.fetchList,
  openDrawer: ACTIONS.openEditDrawer,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
};

type ApplicationListProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    search?: string;
  };

const ApplicationList = (props: ApplicationListProps) => {
  const { list, loading, pageInfo, search, deleteApp, fetchList, openDrawer, openAuthDrawer } = props;

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global, application: appI18n } = locale.business;

  const handleEdit = (app) => {
    openDrawer(true, app);
  };

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, app: Application) => (
        <Link to={`/applications/${app.id}/`}>
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
      width: 130,
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
            <Popconfirm
              title={appI18n.deleteMessage}
              onConfirm={() => deleteApp(record.id)}
              okText={global.yes}
              cancelText={global.no}
              placement="topRight">
              <DeleteButton
                danger
                type="default"
                size="small"
                shape="circle"
                title={global.remove}
                style={{ marginLeft: 8 }}
              />
            </Popconfirm>
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
            organizationId,
            page: pagination.current,
            search: search || '',
            size: pagination.pageSize,
            type: 'user',
          });
        }}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationList);
