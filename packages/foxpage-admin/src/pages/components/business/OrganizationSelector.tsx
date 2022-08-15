import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/user';
import { getLoginUser, setLoginUser } from '@/utils/index';

const MenuGroupTitle = styled.a`
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: 48px;
  cursor: pointer;
  color: #5b6b73;
  &:hover {
    color: #5b6b73;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 150px;
  padding: 0 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  &.active {
    color: rgb(41, 141, 248);
    background: rgb(242, 248, 255);
  }
  &:hover {
    color: rgb(41, 141, 248);
    background: rgb(247, 247, 247);
  }
  &.no-select {
    &:hover {
      color: inherit;
      background: inherit;
    }
  }
`;

const mapStateToProps = (state: RootState) => ({
  list: state.system.user.organizations,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchOrganizationList,
  updateOrganizationId: ACTIONS.updateOrganizationId,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function OrganizationSelector(props: IProps) {
  const { list, fetchList, updateOrganizationId } = props;
  const [currOrg, setCurrOrg] = useState<string | undefined>('');

  const { token, userInfo, languagePrefer, organizationPrefer } = getLoginUser();
  const organizationId = userInfo?.organizationId;

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const defaultOrg =
      list && list.length > 0 && organizationPrefer
        ? list.find((item) => item.id === organizationPrefer)
        : list.find((item) => item.default) || list?.[0];

    if (defaultOrg && defaultOrg?.id === organizationId) {
      setCurrOrg(defaultOrg?.name || '');
    } else {
      handleMenuClick({
        key: defaultOrg?.name,
      });
    }
  }, [list]);

  const handleMenuClick = useCallback(
    (item) => {
      setCurrOrg(item.key);

      const newOrganizationId = list && list.find((org) => org.name === item.key)?.id;

      if (newOrganizationId) {
        setLoginUser({
          token,
          userInfo: {
            ...userInfo,
            organizationId: newOrganizationId,
          },
          languagePrefer,
          organizationPrefer: newOrganizationId,
        });

        // push new organization id to store
        updateOrganizationId(newOrganizationId);
      }
    },
    [list, updateOrganizationId],
  );

  const menu = (
    <Menu onClick={handleMenuClick}>
      {list &&
        list.map((item) => (
          <Menu.Item key={item.name}>
            <Link
              to={{
                pathname: '/workspace/application',
              }}>
              <MenuItem>{item.name}</MenuItem>
            </Link>
          </Menu.Item>
        ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <MenuGroupTitle>
        {currOrg}
        <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
      </MenuGroupTitle>
    </Dropdown>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationSelector);
