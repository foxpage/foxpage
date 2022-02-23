import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { EditOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import GlobalContext from '@/pages/GlobalContext';
import { Application } from '@/types/application';
import { OrganizationUrlParams } from '@/types/index';
import periodFormat from '@/utils/period-format';

const mapDispatchToProps = {
  updateDrawerVisible: ACTIONS.updateDrawerVisible,
  fetchList: ACTIONS.fetchList,
};

const mapStateToProps = (state: RootState) => ({
  list: state.group.application.list.list,
  pageInfo: state.group.application.list.pageInfo,
  fetching: state.group.application.list.fetching,
});
type ApplicationListProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ListView = (props: ApplicationListProps) => {
  const { fetching, list, pageInfo, updateDrawerVisible, fetchList } = props;
  const { organizationId } = useParams<OrganizationUrlParams>();

  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const handleEdit = app => {
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
      dataIndex: 'updateTime',
      width: 80,
      render: (_text: string, record: Application) => {
        return (
          <Button
            type="default"
            size="small"
            shape="circle"
            title={global.edit}
            onClick={() => {
              handleEdit(record);
            }}
          >
            <EditOutlined />
          </Button>
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
        pagination={
          pageInfo?.total > pageInfo?.size
            ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
            : false
        }
        onChange={pagination => {
          fetchList({ page: pagination.current, search: '', size: pagination.pageSize, organizationId });
        }}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ListView);
