import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/template';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { Modal } from '../components';

import { List } from './components';

const { Search } = Input;

const PAGE_NUM = 1;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.applications.detail.settings.builder.templates.pageInfo,
  modal: store.applications.detail.settings.builder.templates.modal,
});

const mapDispatchToProps = {
  clear: ACTIONS.clearAll,
  fetch: ACTIONS.fetchTemplates,
  fetchTemplates: ACTIONS.fetchTemplatesContent,
  save: ACTIONS.saveCategory,
  openModal: ACTIONS.updateModalState,
  updatePageNum: ACTIONS.updatePageNum,
  updateSearchText: ACTIONS.updateSearchText,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BuilderWindowSetting = (props: IProps) => {
  const {
    modal,
    pageInfo,
    clear,
    fetch,
    fetchTemplates,
    openModal,
    save,
    updatePageNum,
    updateSearchText,
  } = props;
  const [searchText, setSearchText] = useState('');

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { category, global, setting } = locale.business;

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetch({
        applicationId,
        type: 'template',
        page: pageInfo.page,
        size: pageInfo.size,
        search: searchText,
      });
    }
  }, [applicationId, pageInfo.page, searchText]);

  const handleSearch = (search) => {
    setSearchText(search);

    updatePageNum(PAGE_NUM);
    updateSearchText(search);
  };

  return (
    <Content>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[{ name: setting.builderStoreModalTemplate + ' - ' + global.setting }]}
          />
        }
        style={{ paddingBottom: 0, overflow: 'hidden auto' }}>
        <OptionsBox>
          <Search
            placeholder={category.pageSearchPlaceholder}
            onSearch={(value) => handleSearch(value)}
            style={{ width: 250, marginRight: 12 }}
          />
          <Button type="primary" onClick={() => openModal({ visible: true })}>
            <PlusOutlined /> {global.add}
          </Button>
        </OptionsBox>
        <List />
        <Modal
          type="template"
          list={modal.list}
          loading={modal.loading}
          pageInfo={modal.pageInfo}
          visible={modal.visible}
          onClose={() =>
            openModal({ list: [], loading: false, visible: false, pageInfo: { page: 1, total: 0, size: 10 } })
          }
          onFetch={fetchTemplates}
          onSave={save}
        />
      </FoxPageContent>
    </Content>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BuilderWindowSetting);
