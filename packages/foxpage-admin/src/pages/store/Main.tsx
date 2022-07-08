import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import { EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Empty, Pagination, Row, Spin, Tabs, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { FileTypeEnum } from '@/constants/index';
import { Content, StyledLayout } from '@/pages/components';
import getImageUrlByEnv from '@/utils/get-image-url-by-env';

import GlobalContext from '../GlobalContext';

import BuyModal from './buy/BuyModal';
import PreviewModal from './preview/PreviewModal';
import SelectTool from './SelectTool';

const { TabPane } = Tabs;
const { Meta } = Card;

const FileName = styled.div`
  margin-top: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
`;

const PaginationWrapper = styled.div`
  text-align: center;
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.store.list.loading,
  pageInfo: store.store.list.pageInfo,
  packageResourceList: store.store.list.packageResourceList,
  projectResourceList: store.store.list.projectResourceList,
  variableResourceList: store.store.list.variableResourceList,
  searchText: store.store.list.searchText,
  selectedAppIds: store.store.list.selectedAppIds,
  type: store.store.list.type,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
  fetchStoreResources: ACTIONS.fetchStoreResources,
  updateBuyModalVisible: ACTIONS.updateBuyModalVisible,
  updateProjectResourceItemChecked: ACTIONS.updateProjectResourceItemChecked,
  updatePackageResourceItemChecked: ACTIONS.updatePackageResourceItemChecked,
  updateVariableResourceItemChecked: ACTIONS.updateVariableResourceItemChecked,
  updateSelectedAppIds: ACTIONS.updateSelectedAppIds,
  updateSearchText: ACTIONS.updateSearchText,
  updateType: ACTIONS.updateType,
  fetchAllApplicationList: ACTIONS.fetchAllApplicationList,
  clearAll: ACTIONS.clearAll,
};

type StoreResourceProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Store: React.FC<StoreResourceProps> = (props) => {
  const {
    loading,
    pageInfo,
    packageResourceList,
    projectResourceList,
    variableResourceList,
    searchText,
    selectedAppIds,
    type,
    clearAll,
    updatePreviewModalVisible,
    updateBuyModalVisible,
    fetchStoreResources,
    updateProjectResourceItemChecked,
    updatePackageResourceItemChecked,
    updateVariableResourceItemChecked,
    updateSelectedAppIds,
    updateSearchText,
    updateType,
    fetchAllApplicationList,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { global, file, variable } = locale.business;

  useEffect(() => {
    // fetch page, template, package, variable list info
    fetchStoreResources({ page: pageInfo.page, size: pageInfo.size, search: '', type: FileTypeEnum.page });

    // fetch all application list
    fetchAllApplicationList({ page: 1, size: 1000 });

    return () => {
      clearAll();
    };
  }, []);

  const handleTabsChange = (data) => {
    updateSelectedAppIds([]);
    updateSearchText('');
    updateType(data);
    fetchStoreResources({ page: pageInfo.page, size: pageInfo.size, search: '', type: data });
  };

  const handleClickView = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    updatePreviewModalVisible(true, item);
  };

  const handleBuyClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    updateBuyModalVisible(
      true,
      type === FileTypeEnum.package || type === FileTypeEnum.variable
        ? [item.id]
        : item.files.map((item) => item.id),
    );
  };

  const PageContent = useMemo(() => {
    const isPageOrTemplate = type === FileTypeEnum.page || type === FileTypeEnum.template;
    const isVariable = type === FileTypeEnum.variable;
    const _type = isPageOrTemplate ? 'default' : type;
    const resourceMap = {
      variable: variableResourceList,
      package: packageResourceList,
      default: projectResourceList,
    };
    const resource = resourceMap[_type];

    return (
      <Spin spinning={loading}>
        <Row gutter={16} style={{ minHeight: 24, paddingBottom: 24, marginLeft: 4, marginRight: 4 }}>
          {resource?.length > 0 &&
            resource.map((resource) => {
              const actions = [
                <Checkbox checked={resource.checked} />,
                <ShoppingCartOutlined
                  onClick={(e) => {
                    handleBuyClick(e, resource);
                  }}
                />,
              ];
              if (isPageOrTemplate) {
                actions.splice(
                  1,
                  0,
                  <EyeOutlined
                    onClick={(e) => {
                      handleClickView(e, resource);
                    }}
                  />,
                );
              }
              return (
                <Col span={6} key={resource.id}>
                  <Card
                    key={resource.id}
                    onClick={() => {
                      isPageOrTemplate
                        ? updateProjectResourceItemChecked(resource.id)
                        : isVariable
                        ? updateVariableResourceItemChecked(resource.id)
                        : updatePackageResourceItemChecked(resource.id);
                    }}
                    cover={
                      isPageOrTemplate ? (
                        <img alt="example" src={getImageUrlByEnv('/images/placeholder.png')} />
                      ) : null
                    }
                    actions={actions}
                    style={{ marginBottom: 12 }}
                    hoverable
                    bordered>
                    <Meta
                      title={
                        <Tooltip placement="topLeft" title={resource.name}>
                          {resource.name}
                        </Tooltip>
                      }
                      description={`${global.application}: ${resource.application?.name}`}
                    />
                    {isPageOrTemplate && (
                      <FileName>
                        {file.name}:
                        {resource.files &&
                          resource.files.map((item) => {
                            return (
                              <span key={item.id} style={{ marginLeft: 6 }}>
                                {item.name}
                              </span>
                            );
                          })}
                      </FileName>
                    )}
                  </Card>
                </Col>
              );
            })}
          {!loading && resource?.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '48px auto' }} />
          )}
        </Row>
      </Spin>
    );
  }, [loading, type, projectResourceList, packageResourceList, variableResourceList, global, file]);

  const PaneContent = useMemo(() => {
    return (
      <React.Fragment>
        <SelectTool type={type} />
        {PageContent}
        <PaginationWrapper>
          <Pagination
            showQuickJumper
            hideOnSinglePage
            current={pageInfo.page}
            pageSize={pageInfo.size}
            total={pageInfo.total}
            onChange={(page) => {
              fetchStoreResources({
                page,
                size: pageInfo.size,
                search: searchText,
                appIds: selectedAppIds,
                type,
              });
            }}
          />
        </PaginationWrapper>
      </React.Fragment>
    );
  }, [type, PageContent]);

  return (
    <StyledLayout>
      <Content>
        <Tabs
          centered
          size="large"
          destroyInactiveTabPane
          defaultActiveKey="page"
          onChange={handleTabsChange}>
          <TabPane tab={file.page} key={FileTypeEnum.page}>
            {PaneContent}
          </TabPane>
          <TabPane tab={file.template} key={FileTypeEnum.template}>
            {PaneContent}
          </TabPane>
          <TabPane tab={file.package} key={FileTypeEnum.package}>
            {PaneContent}
          </TabPane>
          <TabPane tab={variable.title} key={FileTypeEnum.variable}>
            {PaneContent}
          </TabPane>
        </Tabs>
      </Content>
      <PreviewModal />
      <BuyModal />
    </StyledLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
