import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import GlobalContext from '@/pages/GlobalContext';
import { Application } from '@/types/application';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (state: RootState) => ({
  organizationId: state.system.organizationId,
  list: state.group.application.list.list,
  fetching: state.group.application.list.fetching,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  updateDrawerVisible: ACTIONS.updateDrawerVisible,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
};

type ApplicationListProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ListView = (props: ApplicationListProps) => {
  const { organizationId, fetching, list, fetchList, updateDrawerVisible, openAuthDrawer } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const handleEdit = (app) => {
    updateDrawerVisible(true, app);
  };

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, app: Application) => {
        return <Link to={`/organization/${organizationId}/application/${app.id}/detail/page`}>{text}</Link>;
      },
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
        dataSource={list}
        columns={columns}
        loading={fetching}
        pagination={false}
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

export default connect(mapStateToProps, mapDispatchToProps)(ListView);
