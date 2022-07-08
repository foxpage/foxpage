import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/user';
import GlobalContext from '@/pages/GlobalContext';
import periodFormat from '@/utils/period-format';

import AddAccountDrawer from './AddAccountDrawer';

const PAGE_SIZE = 10000;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
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

const User: React.FC<UserListType> = (props) => {
  const {
    organizationId,
    loading,
    users,
    addedUsers,
    updateAccountDrawerOpen,
    fetchUsers,
    deleteUser,
    updateAddedUserInfo,
  } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, team, login } = locale.business;

  useEffect(() => {
    fetchUsers({ organizationId, page: 1, size: PAGE_SIZE });
  }, [fetchUsers, organizationId]);

  useEffect(() => {
    if (addedUsers && addedUsers.account && addedUsers.password) {
      Modal.info({
        title: team.accountInfo,
        content: (
          <div>
            <div>
              {login.account}:&nbsp;&nbsp;{addedUsers.account}
            </div>
            <div>
              {login.password}:&nbsp;{addedUsers.password}
            </div>
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
          }}>
          <PlusOutlined /> {team.addUser}
        </Button>
      </div>
      <Table
        rowKey="userId"
        loading={loading}
        columns={[
          {
            title: team.account,
            dataIndex: 'account',
          },
          {
            title: team.userId,
            dataIndex: 'userId',
          },
          {
            title: team.joinTime,
            key: 'joinTime',
            width: 200,
            render: (_text: string, record) => periodFormat(record.joinTime, 'unknown'),
          },
          {
            title: global.actions,
            key: 'status',
            width: 80,
            render: (_text: string, user) => {
              return (
                <Popconfirm
                  title={`${global.deleteMsg} ${user.account}?`}
                  onConfirm={() => {
                    deleteUser({ organizationId, userIds: [user.userId] });
                  }}
                  okText={global.yes}
                  cancelText={global.no}>
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
