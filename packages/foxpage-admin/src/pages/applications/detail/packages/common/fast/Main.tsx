import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { DownOutlined, SearchOutlined, SwapRightOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Input, message, Select, Spin, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/fast';
import { Pagination } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { RemoteComponentItem } from '@/types/index';

import { ComponentResource } from '../detail';

const { Option } = Select;

const GroupContainer = styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  padding-left: 20%;
`;

const Tips = styled.div`
  margin-bottom: 8px;
  font-style: italic;
  font-size: 12px;
  padding: 0 20px;
  color: #656565;
  text-align: right;
  display: flex;
  flex-direction: row;
  line-height: 24px;
  span {
    color: #f90;
    font-size: 16px;
    padding-right: 12px;
  }
`;

const List = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0 20px;
  max-height: 400px;
  overflow: auto;
`;

const Row = styled.li`
  padding: 8px;
  margin-bottom: 8px;
  background-color: #fafafa;
  &:hover {
    background-color: #e6f7ff;
  }
`;

const Header = styled.div``;

const Name = styled.span`
  padding: 0 12px;
  font-weight: 500;
  line-height: 40px;
`;

const ExpendBtn = styled.span`
  float: right;
  line-height: 40px;
  display: inline-block;
  padding: 0 10px;
  color: #797979;
  &:hover {
    cursor: pointer;
  }
`;

const GoResource = styled.div`
  font-size: 12px;
  line-height: 32px;
  margin-left: 20px;
  a {
    color: #656565;
    &:hover {
      color: #1890ff;
    }
  }
`;

const Version = styled.span`
  font-size: 12px;
  color: #f90;
  background-color: #fff6e5;
  padding: 0 4px;
  border-radius: 4px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  groups: store.applications.detail.resources.groups.groupList,
  packages: store.applications.detail.packages.fast.packages,
  pageInfo: store.applications.detail.packages.fast.pageInfo,
  groupId: store.applications.detail.packages.fast.groupId,
  loading: store.applications.detail.packages.fast.loading,
  checkedList: store.applications.detail.packages.fast.checkedList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPackages: ACTIONS.fetchPackages,
  update: ACTIONS.updateChanges,
  updateSelected: ACTIONS.updateSelected,
  selectGroup: ACTIONS.selectGroup,
  updateSearchName: ACTIONS.updateSearchName,
  updateComponentRemoteInfo: ACTIONS.updateComponentRemoteInfo,
};

type PackagesProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main = (props: PackagesProps) => {
  const {
    applicationId,
    groups = [],
    packages = [],
    pageInfo,
    loading,
    checkedList,
    clearAll,
    fetchPackages,
    update,
    updateSelected,
    selectGroup,
    updateSearchName,
    updateComponentRemoteInfo,
  } = props;
  const [groupId, setGroupId] = useState<string>('');
  const [expendIds, setExpendIds] = useState<string[]>([]);
  const [name, setName] = useState<string>('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, package: packageI18n } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  const handleSearch = (page: number = 1, size: number = pageInfo.size) => {
    if (!groupId) {
      message.warning(packageI18n.groupTips);
      return;
    }

    selectGroup(groupId);

    updateSearchName(name);

    if (applicationId)
      fetchPackages({
        applicationId,
        groupId,
        page,
        size,
        name: name,
      });
  };

  const handleExpend = (id: string) => {
    const idx = expendIds.findIndex((item) => item === id);
    if (idx < 0) {
      expendIds.push(id);
    } else {
      expendIds.splice(idx, 1);
    }
    setExpendIds(expendIds.concat([]));
  };

  const handleCheck = (id: string) => {
    const newList = checkedList.concat([]) as string[];
    const idx = newList.findIndex((item) => item === id);

    if (idx < 0) {
      newList.push(id);
    } else {
      newList.splice(idx, 1);
    }
    updateSelected(newList);
  };

  const handleChange = (componentName: string, value: Record<string, string>) => {
    update(componentName, value);
  };

  const Item = (pkg: RemoteComponentItem) => {
    const component = pkg.components[0];
    const lastVersion = pkg.lastVersion;
    const key = component?.resource.name || '';
    const expend = expendIds.findIndex((item) => item === key) > -1;
    const checked = checkedList.findIndex((item) => item === key) > -1;
    const isRegistered = !!pkg.lastVersion?.id;
    const isUpdate = isRegistered && component.resource.isNew;

    return (
      <Row key={key}>
        <Header
          onClick={() => {
            handleCheck(key);
          }}>
          <Checkbox checked={checked} />
          <Name>{component?.resource.name}</Name>
          {!isRegistered && (
            <Tag color="volcano" style={{ zoom: 0.8 }}>
              New
            </Tag>
          )}
          {isUpdate && (
            <Tag color="green" style={{ zoom: 0.8 }}>
              Update
            </Tag>
          )}
          {!isRegistered && checked && <Version>{component.component.version}</Version>}
          {isRegistered && checked && (
            <Version>
              {lastVersion?.version || '-'}
              <SwapRightOutlined />
              {component.component.version}
            </Version>
          )}
          <ExpendBtn
            onClick={(e) => {
              handleExpend(key);
              e.stopPropagation();
            }}>
            {expend ? <UpOutlined /> : <DownOutlined />}
          </ExpendBtn>
        </Header>
        {expend && (
          <div>
            <ComponentResource
              lastVersion={pkg.lastVersion}
              componentRemote={component}
              onChange={(value) => handleChange(key, value)}
              updateComponentRemoteInfo={updateComponentRemoteInfo}
            />
          </div>
        )}
      </Row>
    );
  };

  return (
    <div>
      <GroupContainer>
        <Select placeholder={packageI18n.groupTips} style={{ width: 150 }} onChange={setGroupId}>
          {groups.map((group) => (
            <Option key={group.id} value={group.id}>
              {group.name}
            </Option>
          ))}
        </Select>
        <Input
          placeholder={packageI18n.inputNameTips}
          style={{ width: 250, marginLeft: 8 }}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => {
            handleSearch();
          }}>
          <SearchOutlined /> {global.search}
        </Button>
        <GoResource>
          <Link
            to={{
              pathname: `/applications/${applicationId}/package/resources/list`,
            }}>
            {packageI18n.noGroupTips}
          </Link>
        </GoResource>
      </GroupContainer>

      <Spin spinning={loading}>
        {packages.length > 0 ? (
          <>
            <Tips>
              <div style={{ color: '#f90' }}>* {packageI18n.batchSaveTips}</div>
              <div style={{ flexGrow: 1 }}>
                {packageI18n.selectCount} : <span>{checkedList.length || 0}</span>
                {packageI18n.total} : <span>{pageInfo.total || 0}</span>
              </div>
            </Tips>
            <List>{packages.map(Item)}</List>
            <Pagination
              current={pageInfo.page}
              total={pageInfo?.total || 0}
              pageSize={pageInfo.size}
              onChange={(page, pageSize) => handleSearch(page, pageSize)}
              style={{ textAlign: 'center', padding: '24px 0 0 0' }}
            />
          </>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
