import React from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { FileTypeEnum } from '@/constants/global';
import { StorePackageResource, StoreProjectResource } from '@/types/store';

const ToolRow = styled.div`
  display: flex;
  margin: 0px 12px 12px 0;
`;

const ToolLabel = styled.div`
  margin: 4px 10px 4px 4px;
  line-height: 24px;
  font-weight: 500;
`;

const ToolSelect = styled.div`
  -webkit-box-flex: 1;
  flex-grow: 1;
`;

const SearchRow = styled.div`
  border-bottom: 1px solid rgb(221, 221, 221);
  line-height: 48px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const SearchRowTitle = styled.div`
  flex: 0 0 80px;
  text-align: center;
  color: rgb(24, 144, 255);
  border-bottom: 2px solid rgb(24, 144, 255);
`;

const SearchRowContent = styled.div`
  flex: 0 0 300px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const { Search } = Input;
const { Option } = Select;

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.store.list.pageInfo,
  searchText: store.store.list.searchText,
  selectedAppIds: store.store.list.selectedAppIds,
  projectResourceList: store.store.list.projectResourceList,
  packageResourceList: store.store.list.packageResourceList,
  applicationList: store.store.list.allApplication,
});

const mapDispatchToProps = {
  fetchStoreResources: ACTIONS.fetchStoreResources,
  updateSelectedAppIds: ACTIONS.updateSelectedAppIds,
  updateSearchText: ACTIONS.updateSearchText,
  updateBuyModalVisible: ACTIONS.updateBuyModalVisible,
};

interface IProps {
  type: string;
}

type StoreResourceToolProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const SelectTool: React.FC<StoreResourceToolProps> = props => {
  const {
    type,
    pageInfo,
    searchText,
    selectedAppIds,
    projectResourceList,
    packageResourceList,
    applicationList,
    fetchStoreResources,
    updateSelectedAppIds,
    updateSearchText,
    updateBuyModalVisible,
  } = props;

  const resourceList: Array<StoreProjectResource | StorePackageResource> =
    type === FileTypeEnum.package ? packageResourceList : projectResourceList;

  const handleSearch = text => {
    fetchStoreResources({ type, appIds: selectedAppIds, search: text, page: pageInfo.page, size: pageInfo.size });
  };

  const handleSearchTextChange = e => {
    updateSearchText(e.target.value);
  };

  const handleAdd = () => {
    const ids =
      type === FileTypeEnum.package
        ? resourceList
            .filter(item => item.checked)
            .map(item => {
              return item.id;
            })
        : resourceList
            .filter(item => item.checked)
            .map(item => {
              return (item as StoreProjectResource).files.map(item => item.id);
            })
            .flat();
    updateBuyModalVisible(true, ids);
  };

  return (
    <React.Fragment>
      <ToolRow>
        <ToolLabel>Application:</ToolLabel>
        <ToolSelect>
          <Select
            mode="multiple"
            style={{ width: '60%' }}
            placeholder="select application"
            defaultValue={[]}
            onChange={value => {
              updateSelectedAppIds(value);
              fetchStoreResources({
                type,
                search: searchText,
                page: pageInfo.page,
                size: pageInfo.size,
                appIds: value,
              });
            }}
          >
            {applicationList?.map(application => (
              <Option key={application.id} value={application.id}>
                {application.name}
              </Option>
            ))}
          </Select>
        </ToolSelect>
      </ToolRow>
      <SearchRow>
        <SearchRowTitle>All({pageInfo.total})</SearchRowTitle>
        <SearchRowContent>
          <Search
            value={searchText}
            placeholder="input search text"
            allowClear
            onSearch={handleSearch}
            onChange={handleSearchTextChange}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ marginLeft: 8 }}
            disabled={!resourceList.find(item => item.checked)}
            onClick={handleAdd}
          >
            Add
          </Button>
        </SearchRowContent>
      </SearchRow>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectTool);
