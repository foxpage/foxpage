import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/user';
import { OrganizationUrlParams } from '@/types/application';
import periodFormat from '@/utils/period-format';

import AddAccountDrawer from './AddAccountDrawer';

const PAGE_SIZE = 10000;

const mapStateToProps = (store: RootState) => ({
  loading: store.group.user.fetching,
  users: store.group.user.users,
  addedUsers: store.group.user.addedUsers,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  deleteUser: ACTIONS.deleteOrganizationUser,
  updateAccountDrawerOpen: ACTIONS.updateAccountDrawerOpen,
  fetchUsers: ACTIONS.fetchOrganizationUsers,
  updateAddedUserInfo: ACTIONS.updateAddedUserInfo,
};

type UserListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const User: React.FC<UserListType> = props => {
  const { loading, users, addedUsers, updateAccountDrawerOpen, fetchUsers, deleteUser, updateAddedUserInfo } = props;

  const { organizationId } = useParams<OrganizationUrlParams>();

  useEffect(() => {
    fetchUsers({ organizationId, page: 1, size: PAGE_SIZE });
  }, []);

  useEffect(() => {
    if (addedUsers && addedUsers.account && addedUsers.password) {
      Modal.info({
        title: 'Account Info',
        content: (
          <div>
            <div>Account:&nbsp;&nbsp;{addedUsers.account}</div>
            <div>Password:&nbsp;{addedUsers.password}</div>
          </div>
        ),
        onOk() {
          updateAddedUserInfo({ account: '', password: '' });
        },
      });
    }
  }, [addedUsers]);

  return (
    <React.Fragment>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          onClick={() => {
            updateAccountDrawerOpen(true);
          }}
        >
          <PlusOutlined /> Add User
        </Button>
      </div>
      <Table
        rowKey="userId"
        loading={loading}
        columns={[
          {
            title: 'Account',
            dataIndex: 'account',
          },
          {
            title: 'UserId',
            dataIndex: 'userId',
          },
          {
            title: 'JoinTime',
            key: 'joinTime',
            width: 200,
            render: (_text: string, record) => periodFormat(record.joinTime, 'unknown'),
          },
          {
            title: 'Actions',
            key: 'status',
            width: 80,
            render: (_text: string, user) => {
              return (
                <Popconfirm
                  title={'Are you sure to delete this user?'}
                  onConfirm={() => {
                    deleteUser({ organizationId, userIds: [user.userId] });
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" shape="circle" icon={<DeleteOutlined />} />
                </Popconfirm>
              );
            },
          },
        ]}
        dataSource={users}
        pagination={false}
      />
      <AddAccountDrawer />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(User);
