import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button as AntButton, Popconfirm, Select, Spin, Table, Tooltip } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';

import OperationDrawer from '@/components/business/OperationDrawer';
import { DeleteButton } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeQueryParams,
  AuthorizeUserFetchParams,
  User,
} from '@/types/index';
import { objectEmptyCheck } from '@/utils/index';

import { Role } from './constants/index';

const PAGE = 1;
const SIZE = 99;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const Button = styled(AntButton)`
  align-self: flex-end;
  margin-bottom: 24px;
`;

interface DrawerProp {
  visible: boolean;
  loading: boolean;
  list: AuthorizeListItem[];
  type: string;
  typeId: string;
  applicationId: string;
  needFetch?: boolean;
  onClose?: (status) => void;
  onFetch?: (params: AuthorizeListFetchParams) => void;
  onValidate?: (params: AuthorizeQueryParams, cb?: (role: number) => void) => void;
  onAdd?: (params: AuthorizeAddParams, cb: () => void) => void;
  onDelete?: (params: AuthorizeDeleteParams, cb: () => void) => void;
  onSearch?: (params: AuthorizeUserFetchParams, cb?: (userList) => void) => void;
}

const AuthorizeDrawer: React.FC<DrawerProp> = (props) => {
  const {
    visible,
    loading,
    list,
    type,
    typeId,
    applicationId,
    needFetch = false,
    onClose,
    onFetch,
    onValidate,
    onAdd,
    onDelete,
    onSearch,
  } = props;
  const [childDrawerVisible, setChildDrawerVisible] = useState(false);
  const [selectUserIds, setSelectUserIds] = useState<string[]>([]);
  const [selectRole, setSelectRole] = useState(0);
  const [userList, setUserList] = useState<User[]>([]);
  const [authCheck, setAuthCheck] = useState(false);

  useEffect(() => {
    if (visible && needFetch && typeId) {
      if (typeof onFetch === 'function') {
        onFetch({ applicationId, type, typeId });
      }
    }
  }, [visible, needFetch, type, typeId]);

  useEffect(() => {
    if (visible && typeId) {
      if (typeof onValidate === 'function') {
        onValidate({ applicationId, type, typeId }, (role) => {
          setAuthCheck((role & 1) === 1);
        });
      }
    }
  }, [visible, type, typeId, onValidate]);

  useEffect(() => {
    if (!childDrawerVisible) {
      setSelectUserIds([]);
      setSelectRole(0);
      setUserList([]);
    }
  }, [childDrawerVisible]);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, authorize } = locale.business;

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') onClose(false);
  }, [onClose]);

  const handleSearch = _.debounce((search) => {
    if (typeof onSearch === 'function') {
      onSearch(
        {
          page: PAGE,
          size: SIZE,
          search: search || '',
        },
        (userList) => setUserList(userList || []),
      );
    }
  }, 500);

  const handleAuthDelete = useCallback(
    (roleId: string) => {
      if (applicationId && typeId) {
        if (typeof onDelete === 'function' && typeof onFetch === 'function') {
          onDelete(
            {
              applicationId,
              ids: [roleId],
            },
            () => onFetch({ applicationId, type, typeId }),
          );
        }
      }
    },
    [applicationId, typeId, type, onDelete, onFetch],
  );

  const columns = [
    {
      title: authorize.user,
      dataIndex: 'user',
      key: 'user',
      render: (_: string, record: AuthorizeListItem) => record.target.account || '',
    },
    {
      title: authorize.role,
      dataIndex: 'role',
      key: 'role',
      render: (_: string, record: AuthorizeListItem) => (record.mask ? authorize[Role[record.mask]] : ''),
    },
    {
      title: global.actions,
      dataIndex: '',
      key: '',
      width: 80,
      render: (_: string, record: AuthorizeListItem) => (
        <Popconfirm
          title={authorize.deleteConfirm}
          okText={global.yes}
          cancelText={global.no}
          onConfirm={() => handleAuthDelete(record.id)}>
          <DeleteButton type="default" size="small" shape="circle" title={global.remove} />
        </Popconfirm>
      ),
    },
  ];

  const dataSource = list && list.filter((user) => !user.deleted);

  const handleAuthAdd = useCallback(() => {
    if (applicationId && typeId && !objectEmptyCheck(selectUserIds) && selectRole) {
      if (typeof onAdd === 'function' && typeof onFetch === 'function') {
        onAdd(
          {
            applicationId,
            type,
            typeId,
            targetIds: selectUserIds,
            mask: selectRole,
          },
          () => {
            // close drawer
            handleChildDrawerClose();

            onFetch({ applicationId, type, typeId });
          },
        );
      }
    }
  }, [applicationId, typeId, type, selectUserIds, selectRole, onAdd, onFetch]);

  const userSelectOptions = useMemo(() => {
    return (
      userList &&
      userList.map((user) => ({
        key: user.id,
        label: user.account,
        value: user.id,
      }))
    );
  }, [userList]);

  const userRoleOptions = [
    {
      label: authorize.admin,
      value: Role.admin,
    },
    {
      label: authorize.editor,
      value: Role.editor,
    },
    {
      label: authorize.editor + ' + ' + authorize.publish,
      value: Role.editorPublish,
    },
  ];

  const handleChildDrawerClose = () => {
    setChildDrawerVisible(false);
    setSelectUserIds([]);
    setSelectRole(0);
  };

  return (
    <OperationDrawer
      destroyOnClose
      maskClosable={false}
      width={450}
      title={global.userPermission}
      open={visible}
      onClose={handleClose}>
      <Container>
        <div style={{ textAlign: 'right' }}>
          <Tooltip placement="topRight" title={type !== 'application' && !authCheck ? global.accessDeny : ''}>
            <Button
              icon={<PlusOutlined />}
              disabled={type !== 'application' && !authCheck}
              onClick={() => setChildDrawerVisible(!childDrawerVisible)}
              style={{ marginBottom: 12 }}>
              {authorize.add}
            </Button>
          </Tooltip>
        </div>
        <Spin spinning={loading}>
          <Table
            bordered={false}
            pagination={false}
            rowKey={(record: AuthorizeListItem): string => record.id.toString()}
            columns={columns}
            dataSource={dataSource}
          />
        </Spin>
        <OperationDrawer
          destroyOnClose
          maskClosable={false}
          width={450}
          open={childDrawerVisible}
          title={authorize.add}
          actions={
            <Button type="primary" onClick={handleAuthAdd}>
              {global.apply}
            </Button>
          }
          onClose={handleChildDrawerClose}>
          <Container>
            <Select
              showArrow={false}
              mode="multiple"
              placeholder={authorize.placeholderUser}
              options={userSelectOptions}
              optionFilterProp="label"
              onSearch={handleSearch}
              onChange={setSelectUserIds}
              style={{ width: '100%' }}
            />
            <Select
              showArrow={false}
              placeholder={authorize.placeholderRole}
              options={userRoleOptions}
              value={!selectRole ? undefined : selectRole}
              onChange={setSelectRole}
              style={{ width: '100%', marginTop: 12 }}
            />
          </Container>
        </OperationDrawer>
      </Container>
    </OperationDrawer>
  );
};

export default AuthorizeDrawer;
