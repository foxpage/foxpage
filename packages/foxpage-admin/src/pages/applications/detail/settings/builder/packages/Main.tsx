import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { clearAll, fetchComponentsAction } from '@/actions/applications/detail/packages/list';
import * as ACTIONS from '@/actions/applications/detail/settings/builder/component';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { Modal } from '../components';

import { Editor, List } from './components';

const { Search } = Input;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  components: store.applications.detail.packages.list.componentList,
  loading: store.applications.detail.packages.list.loading,
  modalPageInfo: store.applications.detail.packages.list.pageInfo,
  pageInfo: store.applications.detail.settings.builder.components.pageInfo,
  visible: store.applications.detail.settings.builder.components.modalVisible,
});

const mapDispatchToProps = {
  clear: ACTIONS.clearAll,
  fetch: ACTIONS.fetchComponents,
  save: ACTIONS.saveCategory,
  openModal: ACTIONS.updateModalVisible,
  clearAll,
  fetchComponents: fetchComponentsAction,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BuilderWindowSetting = (props: IProps) => {
  const {
    components,
    loading,
    modalPageInfo,
    pageInfo,
    visible,
    clear,
    clearAll,
    fetch,
    fetchComponents,
    openModal,
    save,
  } = props;
  const [searchText, setSearchText] = useState('');

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, setting, application: applicationI18n, category } = locale.business;

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetch({
        applicationId,
        ...pageInfo,
        search: searchText,
      });
    }
  }, [applicationId, pageInfo.page, searchText]);

  const handleModalClose = () => {
    // clear package list state
    clearAll();

    openModal(false);
  };

  const handleFetchComponents = (params) => {
    if (params)
      fetchComponents({
        ...params,
        type: 'component',
      });
  };

  return (
    <Content>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: applicationI18n.applicationList,
                link: '/#/workspace/applications',
              },
              { name: setting.componentBar + ' - ' + global.setting },
            ]}
          />
        }
        style={{ paddingBottom: 0, overflow: 'hidden auto' }}>
        <OptionsBox>
          <Search
            placeholder={category.componentSearchPlaceholder}
            onSearch={(value) => setSearchText(value)}
            style={{ width: 250, marginRight: 8 }}
          />
          <Button type="primary" onClick={() => openModal(true)}>
            <PlusOutlined /> {global.add}
          </Button>
        </OptionsBox>
        <List />
        <Editor />
        <Modal
          type="component"
          list={components}
          loading={loading}
          pageInfo={modalPageInfo}
          visible={visible}
          onClose={handleModalClose}
          onFetch={handleFetchComponents}
          onSave={save}
        />
      </FoxPageContent>
    </Content>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BuilderWindowSetting);
