import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { Card, Empty, Modal, Pagination, Popover, Radio, Row, Space, Spin, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/global';
import LocalsView from '@/pages/components/business/LocalsView';
import { Template } from '@/types/builder';
import { StoreProjectResource } from '@/types/store';
import getImageUrlByEnv from '@/utils/get-image-url-by-env';

import { ResourceTabEnum } from './TabEnum';

const StyledModal = styled(Modal)`
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 110px);
      overflow: auto;
      padding-top: 0;
    }
  }
`;

const FileName = styled.div`
  margin-top: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
`;

const { Meta } = Card;
const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  templates: store.builder.templateSelect.templates,
  storeResourceList: store.builder.templateSelect.storeResourceList,
  loading: store.builder.templateSelect.loading,
  pageInfo: store.builder.templateSelect.pageInfo,
  applicationId: store.builder.page.applicationId,
});

const mapDispatchToProps = {
  fetchApplicationTemplate: ACTIONS.fetchApplicationTemplate,
  fetchStoreProjectGoods: ACTIONS.fetchStoreProjectGoods,
};

interface IProps {
  open: boolean;
  templateId?: string;
  title?: string;
  fileType: FileTypeEnum;
  onCancel?: () => void;
  onOk: (templateId?: string) => void;
}

type TemplateSelectModalProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const TemplateSelectModal: React.FC<TemplateSelectModalProps> = props => {
  const {
    loading,
    open,
    fileType,
    templateId,
    templates,
    storeResourceList,
    applicationId,
    title,
    pageInfo,
    onCancel,
    onOk,
    fetchApplicationTemplate,
    fetchStoreProjectGoods,
  } = props;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(templateId);
  const [resourceList, setResourceList] = useState<Template[] | StoreProjectResource[]>([]);
  const [tab, setTab] = useState<string>(ResourceTabEnum.application);

  useEffect(() => {
    if (open) {
      fileType === FileTypeEnum.page
        ? fetchStoreProjectGoods({ ...pageInfo, applicationId, type: fileType })
        : fetchApplicationTemplate(applicationId);
    }
  }, [open]);

  useEffect(() => {
    setSelectedTemplateId(templateId);
  }, [templateId]);

  useEffect(() => {
    setTab(fileType === FileTypeEnum.page ? ResourceTabEnum.store : ResourceTabEnum.application);
  }, [open, fileType]);

  useEffect(() => {
    setResourceList(tab === ResourceTabEnum.application ? templates : storeResourceList);
  }, [tab, templates, storeResourceList]);

  const handleClickOk = useCallback(() => {
    onOk(selectedTemplateId);
  }, [selectedTemplateId]);

  const handleTabsChange = (tab: string) => {
    setTab(tab);
    if (tab === ResourceTabEnum.application) {
      fetchApplicationTemplate(applicationId);
    } else {
      fetchStoreProjectGoods({ page: 1, size: pageInfo.size, applicationId, type: fileType });
    }
  };

  const handleCardClick = id => {
    if (tab === ResourceTabEnum.application) {
      setSelectedTemplateId(id);
    }
  };

  const TemplateRowContent = useMemo(() => {
    return (
      <Spin spinning={loading}>
        <Row gutter={16} style={{ paddingBottom: 12 }}>
          {resourceList &&
            resourceList.map(resource => {
              let actions, MetaContent;
              if (tab === ResourceTabEnum.application) {
                MetaContent = <Meta title={resource.title} style={{ marginBottom: 12 }} />;
                actions = [<Radio checked={resource.id === selectedTemplateId} />];
              } else {
                MetaContent = (
                  <Meta
                    title={resource.name}
                    description={`Application:${resource.application?.name}`}
                    style={{ marginBottom: 12 }}
                  />
                );
                actions = [];
              }

              const CardContent = (
                <Card
                  style={{ width: 258, margin: '12px 6px' }}
                  cover={<img alt="example" src={getImageUrlByEnv('/images/placeholder.png')} />}
                  actions={actions}
                  hoverable
                  onClick={() => {
                    handleCardClick(resource.id);
                  }}
                >
                  {MetaContent}
                  {tab === ResourceTabEnum.store && (
                    <FileName>
                      Content:
                      {(resource as StoreProjectResource).files
                        ?.map(file => {
                          return file.contents?.map(item => {
                            return <span style={{ marginLeft: 6 }}>{item.title}</span>;
                          });
                        })
                        .flat()}
                    </FileName>
                  )}
                </Card>
              );
              return tab === ResourceTabEnum.application ? (
                CardContent
              ) : (
                <Popover
                  placement="bottom"
                  title="Content"
                  content={
                    <Radio.Group
                      name="radiogroup"
                      value={selectedTemplateId}
                      onChange={e => {
                        setSelectedTemplateId(e.target.value);
                      }}
                    >
                      <Space direction="vertical">
                        {(resource as StoreProjectResource).files
                          ?.map(file => {
                            return file.contents?.map(item => {
                              return (
                                <Radio value={item.id}>
                                  {item.title}
                                  <LocalsView
                                    maxLocaleCount={100}
                                    locales={item.tags.filter(item => item.locale).map(item => item.locale)}
                                  />
                                </Radio>
                              );
                            });
                          })
                          .flat()}
                      </Space>
                    </Radio.Group>
                  }
                  autoAdjustOverflow
                  arrowPointAtCenter
                >
                  {CardContent}
                </Popover>
              );
            })}
          {resourceList?.length === 0 && !loading && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '48px auto' }} />
          )}
        </Row>
      </Spin>
    );
  }, [tab, resourceList, selectedTemplateId, loading]);

  const PaginationContent = useMemo(() => {
    return (
      <Pagination
        showQuickJumper
        hideOnSinglePage
        current={pageInfo.page}
        size={pageInfo.size}
        total={pageInfo.total}
        onChange={(page, pageSize) => {
          fetchStoreProjectGoods({
            page,
            size: pageSize,
            applicationId,
            type: fileType,
          });
        }}
      />
    );
  }, [pageInfo, fileType]);

  return (
    <StyledModal
      title={title || 'Select Template'}
      visible={open}
      width="1112px"
      onOk={handleClickOk}
      style={{ height: '70%' }}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
    >
      {fileType === FileTypeEnum.page ? (
        TemplateRowContent
      ) : (
        <Tabs centered destroyInactiveTabPane defaultActiveKey="application" onChange={handleTabsChange}>
          <TabPane tab="Application" key={ResourceTabEnum.application}>
            {TemplateRowContent}
          </TabPane>
          <TabPane tab="Store" key={ResourceTabEnum.store}>
            {TemplateRowContent}
            {PaginationContent}
          </TabPane>
        </Tabs>
      )}
    </StyledModal>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(TemplateSelectModal);
