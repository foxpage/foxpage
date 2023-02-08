import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import { EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Empty, Pagination, Row, Spin, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { FileType, WIDTH_DEFAULT } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { getContentsFirstPicture } from '@/utils/image-url';

import { BuyModal, PreviewModal, SelectTool } from './components';

const { TabPane } = Tabs;
const { Meta } = Card;

const PAGE_NUM = 1;

const Title = styled.span`
  display: inline-block;
  white-space: normal;
`;

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
  clearAll: ACTIONS.clearAll,
  fetchResources: ACTIONS.fetchResources,
  fetchAllApplicationList: ACTIONS.fetchAllApplicationList,
  updateType: ACTIONS.updateType,
  updateBuyModalVisible: ACTIONS.updateBuyModalVisible,
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
  updateProjectResourceItemChecked: ACTIONS.updateProjectResourceItemChecked,
  updatePackageResourceItemChecked: ACTIONS.updatePackageResourceItemChecked,
  updateVariableResourceItemChecked: ACTIONS.updateVariableResourceItemChecked,
  updateSearchText: ACTIONS.updateSearchText,
  updateSelectedAppIds: ACTIONS.updateSelectedAppIds,
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
    fetchResources,
    fetchAllApplicationList,
    updateType,
    updateBuyModalVisible,
    updatePreviewModalVisible,
    updateProjectResourceItemChecked,
    updatePackageResourceItemChecked,
    updateVariableResourceItemChecked,
    updateSearchText,
    updateSelectedAppIds,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file, variable, store } = locale.business;

  useEffect(() => {
    // fetch page|template|package|variable list info
    fetchResources({ page: pageInfo.page, size: pageInfo.size, search: '', type: FileType.page });

    // fetch all application list
    fetchAllApplicationList({ page: 1, size: 1000 });

    return () => {
      clearAll();
    };
  }, []);

  const handleTabsChange = (data) => {
    // clear interaction data
    updateSelectedAppIds([]);
    updateSearchText('');
    updateType(data);

    fetchResources({ page: PAGE_NUM, size: pageInfo.size, search: '', type: data });
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
      type === FileType.package || type === FileType.variable ? [item.id] : item.files.map((item) => item.id),
    );
  };

  const PageContent = useMemo(() => {
    const isPageOrTemplate = type === FileType.page || type === FileType.template;
    const isVariable = type === FileType.variable;
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
                        <img
                          alt="example"
                          src={getContentsFirstPicture(resource?.files)}
                          style={{ height: '130px', objectFit: 'contain', background: '#f4f4f4' }}
                        />
                      ) : null
                    }
                    actions={actions}
                    style={{ marginBottom: 12 }}
                    hoverable
                    bordered>
                    <Meta
                      title={<Title>{resource.name}</Title>}
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
              fetchResources({
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
    <>
      <Content style={{ paddingLeft: 'calc(100vw - 100%)' }}>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: store.name,
                },
              ]}
            />
          }
          style={{ maxWidth: WIDTH_DEFAULT, margin: '0 auto', overflow: 'unset' }}>
          <Tabs
            centered
            size="large"
            destroyInactiveTabPane
            defaultActiveKey="page"
            onChange={handleTabsChange}>
            <TabPane tab={file.page} key={FileType.page}>
              {PaneContent}
            </TabPane>
            <TabPane tab={file.template} key={FileType.template}>
              {PaneContent}
            </TabPane>
            <TabPane tab={file.package} key={FileType.package}>
              {PaneContent}
            </TabPane>
            <TabPane tab={variable.title} key={FileType.variable}>
              {PaneContent}
            </TabPane>
          </Tabs>
        </FoxPageContent>
      </Content>
      <BuyModal />
      <PreviewModal />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
