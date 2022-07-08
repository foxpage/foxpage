import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal as AntdModal, Popconfirm, Select, Spin, Table } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { fetchOrganizationUsers } from '@/actions/group/user';
import * as ACTIONS from '@/actions/teams/list';
import GlobalContext from '@/pages/GlobalContext';
import { OrganizationUser } from '@/types/organization';
import periodFormat from '@/utils/period-format';

const { Option } = Select;
const PAGE_SIZE = 10000;

const Modal = styled(AntdModal)`
  .ant-modal-content {
    height: 100% !important;
    .ant-modal-body {
      overflow: auto !important;
      max-height: calc(100% - 55px) !important;
    }
  }
`;

const mapStateToProps = (store: RootState) => ({
  users: store.group.user.users,
  managementTeam: store.teams.list.managementTeam,
  userManagementDrawerOpen: store.teams.list.userManagementDrawerOpen,
  pageInfo: store.teams.list.pageInfo,
  managementTeamLoading: store.teams.list.managementTeamLoading,
});

const mapDispatchToProps = {
  updateUserManagementDrawerOpenStatus: ACTIONS.updateUserManagementDrawerOpenStatus,
  fetchOrganizationUsers: fetchOrganizationUsers,
  fetchTeamList: ACTIONS.fetchTeamList,
  deleteTeamUsers: ACTIONS.deleteTeamUsers,
  addTeamUsers: ACTIONS.addTeamUsers,
  fetchTeamUsers: ACTIONS.fetchTeamUsers,
};

interface CProps {
  organizationId: string;
}

type MemberManagementType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & CProps;

const MemberManagement: React.FC<MemberManagementType> = (props) => {
  const {
    organizationId,
    users,
    managementTeam,
    userManagementDrawerOpen,
    pageInfo,
    managementTeamLoading,
    updateUserManagementDrawerOpenStatus,
    fetchOrganizationUsers,
    fetchTeamList,
    deleteTeamUsers,
    addTeamUsers,
    fetchTeamUsers,
  } = props;
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { locale } = useContext(GlobalContext);
  const { global, team } = locale.business;

  useEffect(() => {
    if (managementTeam?.id) {
      fetchTeamUsers({ teamId: managementTeam?.id, page: 1, size: PAGE_SIZE });
    }
  }, [managementTeam?.id]);

  useEffect(() => {
    if (organizationId) fetchOrganizationUsers({ organizationId, page: 1, size: PAGE_SIZE });
  }, [fetchOrganizationUsers, organizationId]);

  const handleSelectUserChange = (value: string[]) => {
    setSelectedUserIds(value);
  };

  const handleClose = () => {
    updateUserManagementDrawerOpenStatus(false);
    fetchTeamList({ organizationId, page: pageInfo.page, size: pageInfo.size });
  };

  const handleAdd = () => {
    if (selectedUserIds.length === 0) {
      message.warning(team.selectUserPlaceHolder);
      return;
    }

    addTeamUsers({
      teamId: managementTeam?.id,
      users: users?.filter((user) => selectedUserIds.includes(user.userId)),
      onSuccess: () => {
        setSelectedUserIds([]);
      },
    });
  };

  return (
    <Modal
      title={team.userManagement}
      centered
      visible={userManagementDrawerOpen}
      onCancel={handleClose}
      width="60%"
      style={{ height: '60%' }}
      footer={null}
      destroyOnClose
      maskClosable={false}>
      <Spin spinning={managementTeamLoading}>
        <div style={{ display: 'flex', marginBottom: 12 }}>
          <Select
            mode="multiple"
            placeholder={team.selectUserPlaceHolder}
            value={selectedUserIds}
            onChange={handleSelectUserChange}
            style={{ width: '100%' }}>
            {users?.map((user) => (
              <Option
                key={user.userId}
                value={user.userId}
                disabled={!!managementTeam?.members?.find((item) => item.userId === user.userId)}>
                {user.account}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={() => {
              handleAdd();
            }}>
            <PlusOutlined /> {team.addUser}
          </Button>
        </div>

        <Table
          size="small"
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
              render: (_text: string, user) => periodFormat(user.joinTime, 'unknown'),
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
                      deleteTeamUsers({ teamId: managementTeam.id, users: [user] });
                    }}
                    okText={global.yes}
                    cancelText={global.no}>
                    <Button size="small" shape="circle" icon={<DeleteOutlined />} />
                  </Popconfirm>
                );
              },
            },
          ]}
          rowKey={(record: OrganizationUser): string => record.userId.toString()}
          dataSource={managementTeam?.members || []}
          pagination={false}
        />
      </Spin>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MemberManagement);
