import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import { EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Empty, Layout, Pagination, Row, Spin, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { FileTypeEnum } from '@/constants/index';
import getImageUrlByEnv from '@/utils/get-image-url-by-env';

import GlobalContext from '../GlobalContext';

import BuyModal from './buy/BuyModal';
import PreviewModal from './preview/PreviewModal';
import SelectTool from './SelectTool';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Meta } = Card;

const StyledLayout = styled(Layout)`
  height: 100%;
  max-width: 1136px;
  margin: 0 auto;
  width: 100%;
`;

const FileName = styled.div`
  margin-top: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.store.list.loading,
  pageInfo: store.store.list.pageInfo,
  projectResourceList: store.store.list.projectResourceList,
  packageResourceList: store.store.list.packageResourceList,
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
  updateSelectedAppIds: ACTIONS.updateSelectedAppIds,
  updateSearchText: ACTIONS.updateSearchText,
  updateType: ACTIONS.updateType,
  fetchAllApplicationList: ACTIONS.fetchAllApplicationList,
  clearAll: ACTIONS.clearAll,
};

type StoreResourceProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Store: React.FC<StoreResourceProps> = props => {
  const {
    loading,
    pageInfo,
    projectResourceList,
    packageResourceList,
    searchText,
    selectedAppIds,
    type,
    clearAll,
    updatePreviewModalVisible,
    updateBuyModalVisible,
    fetchStoreResources,
    updateProjectResourceItemChecked,
    updatePackageResourceItemChecked,
    updateSelectedAppIds,
    updateSearchText,
    updateType,
    fetchAllApplicationList,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  useEffect(() => {
    fetchStoreResources({ page: pageInfo.page, size: pageInfo.size, search: '', type: FileTypeEnum.page });
    fetchAllApplicationList({ page: 1, size: 1000 });
    return () => {
      clearAll();
    };
  }, []);

  const handleTabsChange = data => {
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
    updateBuyModalVisible(true, type === FileTypeEnum.package ? [item.id] : item.files.map(item => item.id));
  };

  const PageContent = useMemo(() => {
    const isPageOrTemplate = type === FileTypeEnum.page || type === FileTypeEnum.template;
    const resource = isPageOrTemplate ? projectResourceList : packageResourceList;
    return (
      <Spin spinning={loading}>
        <Row gutter={16} style={{ minHeight: 24, paddingBottom: 24 }}>
          {resource?.length > 0 &&
            resource.map(resource => {
              const actions = [
                <Checkbox checked={resource.checked} />,
                <ShoppingCartOutlined
                  onClick={e => {
                    handleBuyClick(e, resource);
                  }}
                />,
              ];
              if (isPageOrTemplate) {
                actions.splice(
                  1,
                  0,
                  <EyeOutlined
                    onClick={e => {
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
                        : updatePackageResourceItemChecked(resource.id);
                    }}
                    cover={
                      isPageOrTemplate ? <img alt="example" src={getImageUrlByEnv('/images/placeholder.png')} /> : null
                    }
                    actions={actions}
                    style={{ marginBottom: 12 }}
                    hoverable
                    bordered
                  >
                    <Meta title={resource.name} description={`${global.application}: ${resource.application.name}`} />
                    {isPageOrTemplate && (
                      <FileName>
                        {file.name}:
                        {resource.files.map(item => {
                          return <span style={{ marginLeft: 6 }}>{item.name}</span>;
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
  }, [loading, type, projectResourceList, packageResourceList, global, file]);

  const PaneContent = useMemo(() => {
    return (
      <React.Fragment>
        <SelectTool type={type} />
        {PageContent}
        <Pagination
          showQuickJumper
          hideOnSinglePage
          current={pageInfo.page}
          size={pageInfo.size}
          total={pageInfo.total}
          onChange={(page, pageSize) => {
            fetchStoreResources({
              page,
              size: pageSize,
              search: searchText,
              appIds: selectedAppIds,
              type,
            });
          }}
        />
      </React.Fragment>
    );
  }, [type, PageContent]);

  return (
    <StyledLayout>
      <Content style={{ padding: '24px', minHeight: 280 }}>
        <Tabs centered size="large" destroyInactiveTabPane defaultActiveKey="page" onChange={handleTabsChange}>
          <TabPane tab={file.page} key={FileTypeEnum.page}>
            {PaneContent}
          </TabPane>
          <TabPane tab={file.template} key={FileTypeEnum.template}>
            {PaneContent}
          </TabPane>
          <TabPane tab={file.package} key={FileTypeEnum.package}>
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
