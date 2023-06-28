import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Card, Empty, Input, message, Modal, Radio, Row, Spin, Tabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { LocaleView, Pagination, ScrollBar } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { getTemplateRelationKey } from '@/store/sagas/builder/utils';
import { getContentsFirstPicture, objectEmptyCheck } from '@/utils/index';

export enum TabEnum {
  application = 'application',
  permission = 'involve',
  user = 'user',
}

const PAGE_NUM = 1;
const CONTENT_ID_LENGTH = 20;

const { Search } = Input;

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

const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 24px;
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

const CheckContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  color: green;
  font-size: 16px;
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
  updateTemplateBind: PAGE_ACTIONS.templateOpenInPage,
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
    updateTemplateBind,
  } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page || PAGE_NUM);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [tab, setTab] = useState<string>(TabEnum.application);
  const [fileId, setFileId] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder, global, project: projectI18n } = locale.business;

  useEffect(() => {
    if (open) {
      const tpl: string = pageNode?.directive?.tpl || '';
      if (tpl) {
        setSelectedTemplateId(tpl.substr(tpl.indexOf(':') + 1, CONTENT_ID_LENGTH));
      }
    }
  }, [open, pageNode]);

  useEffect(() => {
    if (open) {
      fetchPageTemplate({
        applicationId,
        type,
        scope: tab,
        page: PAGE_NUM,
        size: pageInfo.size,
      });
    } else {
      setFileId(undefined);
      setPageNum(PAGE_NUM);
      setSearch('');
      setSelectedTemplateId(undefined);
      setTab(TabEnum.application);
    }
  }, [open, tab]);

  const handleTabsChange = (tab: string) => {
    setPageNum(PAGE_NUM);
    setSearch('');

    setTab(tab);
  };

  const handleOnPagination = (num: number) => {
    setPageNum(num);

    fetchPageTemplate({
      applicationId,
      page: num,
      scope: tab,
      search,
      size: pageInfo.size,
      type,
    });
  };

  const handleOnSearch = () => {
    setPageNum(PAGE_NUM);

    fetchPageTemplate({
      applicationId,
      page: PAGE_NUM || pageNum,
      scope: tab,
      search,
      size: pageInfo.size,
      type,
    });
  };

  const handleClose = () => {
    updateTemplateBind(false);

    openModal(false);
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

    handleClose();
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
      open={open}
      width={1130}
      onOk={handleOk}
      onCancel={handleClose}
      bodyStyle={{
        padding: 0,
      }}
      style={{
        height: 800,
      }}>
      <Container>
        <Header>
          <Tabs centered destroyInactiveTabPane defaultActiveKey="application" onChange={handleTabsChange}>
            <TabPane tab={global.application} key={TabEnum.application} />
            <TabPane tab={global.personal} key={TabEnum.user} />
            <TabPane tab={projectI18n.shared} key={TabEnum.permission} />
          </Tabs>
          <SearchContainer>
            <Search
              size="small"
              placeholder={global.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleOnSearch}
              style={{ width: 250 }}
            />
          </SearchContainer>
        </Header>
        <Body>
          <Spin spinning={loading}>
            <Row gutter={16}>
              {templates &&
                templates.map((resource) => (
                  <Card
                    cover={
                      <img
                        alt="example"
                        src={getContentsFirstPicture(resource?.contents)}
                        style={{ height: '130px', objectFit: 'contain', background: '#f4f4f4' }}
                      />
                    }
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
                    {!!resource.contents?.find((content) => content.id === selectedTemplateId) && (
                      <CheckContainer>
                        <CheckCircleOutlined />
                      </CheckContainer>
                    )}
                    {!objectEmptyCheck(resource?.contents) ? (
                      <Drawer className={fileId === resource?.id ? 'active' : ''}>
                        {resource.contents.map((item) => (
                          <RadioContainer key={item.id}>
                            <Radio
                              key={item.id}
                              checked={selectedTemplateId === item.id}
                              onClick={() => setSelectedTemplateId(item.id)}>
                              <DrawerTitle style={{ color: '#1890ff' }}>{item.title}</DrawerTitle>
                              <DrawerTitle style={{ fontSize: 12, marginBottom: 8 }}>
                                ID: {item.id}
                              </DrawerTitle>
                              <LocaleView
                                maxLocaleCount={100}
                                locales={item.tags.filter((item) => item.locale)}
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
                onChange={(page: number) => handleOnPagination(page)}
              />
            </Row>
          </Spin>
        </Body>
      </Container>
    </StyledModal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TemplateSelectModal);
