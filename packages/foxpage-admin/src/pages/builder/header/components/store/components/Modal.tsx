import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { Card, Empty, message, Modal, Radio, Row, Spin, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { LocaleView, Pagination, ScrollBar } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { getTemplateRelationKey } from '@/store/sagas/builder/utils';
import { getImageUrlByEnv, objectEmptyCheck } from '@/utils/index';

export enum TabEnum {
  application = 'application',
  permission = 'involve',
  user = 'user',
}

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

const Container = styled.div`
  height: 100%;
`;

const Header = styled.div``;

const Body = styled.div`
  height: calc(100% - 62px);
  overflow: hidden auto;
  padding: 0 24px;
`;

const Drawer = styled(ScrollBar)`
  width: 90%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  right: -258px;
  overflow: hidden auto;
  background: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.1) -4px 4px 4px 2px;
  padding: 12px;
  transition: right 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  &.active {
    right: 0;
  }
`;

const DrawerTitle = styled.div`
  color: #000000;
`;

const EmptyMask = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
  cursor: not-allowed;
`;

const RadioContainer = styled.div`
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const { Meta } = Card;
const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.builder.header.storeModalPageInfo,
  templates: store.builder.header.storeModalTemplates,
  type: store.builder.header.storeModalType,
  open: store.builder.header.storeModalVisible,
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  loading: store.builder.header.loading,
  templateInPage: store.builder.main.templateOpenInPage,
  pageNode: store.builder.main.pageNode,
});

const mapDispatchToProps = {
  fetchPageTemplate: ACTIONS.fetchPageTemplate,
  openModal: ACTIONS.updateStoreModalVisible,
  cloneContent: PAGE_ACTIONS.cloneContent,
  updatePageNode: PAGE_ACTIONS.updatePageNode,
};

type TemplateSelectModalProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const TemplateSelectModal: React.FC<TemplateSelectModalProps> = (props) => {
  const {
    open,
    applicationId,
    loading,
    pageInfo,
    templates,
    type,
    cloneContent,
    fetchPageTemplate,
    openModal,
    pageNode,
    templateInPage,
    updatePageNode,
  } = props;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [tab, setTab] = useState<string>(TabEnum.user);
  const [fileId, setFileId] = useState<string | undefined>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder, global } = locale.business;

  useEffect(() => {
    if (open) {
      fetchPageTemplate({
        applicationId,
        type,
        scope: tab,
        page: pageInfo.page,
        size: pageInfo.size,
      });
    } else {
      setSelectedTemplateId(undefined);
      setFileId(undefined);
      setTab(TabEnum.user);
    }
  }, [open, tab]);

  const handleTabsChange = (tab: string) => {
    setTab(tab);
  };

  const handleOk = useCallback(() => {
    if (!selectedTemplateId) {
      message.warning(builder.selectPageError);
      return;
    }

    if (templateInPage) {
      const tpl = getTemplateRelationKey(selectedTemplateId);
      const newPageNode = { ...pageNode, directive: { ...(pageNode.directive || {}), tpl: `{{${tpl}}}` } };
      updatePageNode(newPageNode);
    } else {
      cloneContent(selectedTemplateId);
    }
    openModal(false);
  }, [selectedTemplateId]);

  const title = useMemo(() => {
    const typeTitleMap = {
      page: builder.selectPageModalTitle,
      template: builder.selectTemplateModalTitle,
    };

    return typeTitleMap[type];
  }, [type]);

  return (
    <StyledModal
      destroyOnClose
      maskClosable={false}
      title={title}
      visible={open}
      width={1130}
      onOk={handleOk}
      onCancel={() => openModal(false)}
      bodyStyle={{
        padding: 0,
      }}
      style={{
        height: 800,
      }}>
      <Container>
        <Header>
          <Tabs centered destroyInactiveTabPane defaultActiveKey="user" onChange={handleTabsChange}>
            <TabPane tab={global.personal} key={TabEnum.user} />
            <TabPane tab={global.permission} key={TabEnum.permission} />
            <TabPane tab={global.application} key={TabEnum.application} />
          </Tabs>
        </Header>
        <Body>
          <Spin spinning={loading}>
            <Row gutter={16}>
              {templates &&
                templates.map((resource) => (
                  <Card
                    cover={<img alt="example" src={getImageUrlByEnv('/images/placeholder.png')} />}
                    hoverable
                    key={resource.id}
                    onMouseEnter={() => setFileId(resource.id)}
                    onMouseLeave={() => setFileId('')}
                    style={{ width: 258, margin: '12px 6px', position: 'relative', overflow: 'hidden' }}>
                    <Meta
                      title={resource.name}
                      description={
                        <span>
                          {global.idLabel}: {resource.id}
                        </span>
                      }
                      style={{ marginBottom: 12 }}
                    />
                    {!objectEmptyCheck(resource?.contents) ? (
                      <Drawer className={fileId === resource?.id ? 'active' : ''}>
                        {resource.contents.map((item) => (
                          <RadioContainer>
                            <Radio
                              key={item.id}
                              checked={selectedTemplateId === item.id}
                              onClick={() => setSelectedTemplateId(item.id)}>
                              <DrawerTitle>{item.title}</DrawerTitle>
                              <LocaleView
                                maxLocaleCount={100}
                                locales={
                                  item.tags
                                    .filter((item) => item.locale)
                                    .map((item) => item.locale) as string[]
                                }
                              />
                            </Radio>
                          </RadioContainer>
                        ))}
                      </Drawer>
                    ) : (
                      <EmptyMask>{global.noValidContent}</EmptyMask>
                    )}
                  </Card>
                ))}
              {templates?.length === 0 && !loading && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '48px auto' }} />
              )}
            </Row>
            <Row style={{ justifyContent: 'center', marginBottom: 12 }}>
              <Pagination
                hideOnSinglePage
                current={pageInfo.page}
                pageSize={pageInfo.size}
                total={pageInfo.total}
                onChange={(page, size) => {
                  fetchPageTemplate({
                    applicationId,
                    type,
                    scope: tab,
                    page,
                    size,
                  });
                }}
              />
            </Row>
          </Spin>
        </Body>
      </Container>
    </StyledModal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TemplateSelectModal);
