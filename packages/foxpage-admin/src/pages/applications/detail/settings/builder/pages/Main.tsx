import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/page';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { Modal } from '../components';

import { List } from './components';

const { Search } = Input;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  modal: store.applications.detail.settings.builder.pages.modal,
  pageInfo: store.applications.detail.settings.builder.pages.pageInfo,
});

const mapDispatchToProps = {
  clear: ACTIONS.clearAll,
  fetch: ACTIONS.fetchPages,
  fetchPages: ACTIONS.fetchPagesContent,
  save: ACTIONS.saveCategory,
  openModal: ACTIONS.updateModalState,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BuilderWindowSetting = (props: IProps) => {
  const { modal, pageInfo, clear, fetch, fetchPages, openModal, save } = props;
  const [searchText, setSearchText] = useState('');

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { category, global, setting, application: applicationI18n } = locale.business;

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetch({
        applicationId,
        type: 'page',
        page: pageInfo.page,
        size: pageInfo.size,
        search: searchText,
      });
    }
  }, [applicationId, pageInfo.page, searchText]);

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
              { name: setting.builderStoreModalPage + ' - ' + global.setting },
            ]}
          />
        }
        style={{ paddingBottom: 0, overflow: 'hidden auto' }}>
        <OptionsBox>
          <Search
            placeholder={category.pageSearchPlaceholder}
            onSearch={(value) => setSearchText(value)}
            style={{ width: 250, marginRight: 8 }}
          />
          <Button type="primary" onClick={() => openModal({ visible: true })}>
            <PlusOutlined /> {global.add}
          </Button>
        </OptionsBox>
        <List />
        <Modal
          type="page"
          list={modal.list}
          loading={modal.loading}
          pageInfo={modal.pageInfo}
          visible={modal.visible}
          onClose={() =>
            openModal({ list: [], loading: false, visible: false, pageInfo: { page: 1, total: 0, size: 10 } })
          }
          onFetch={fetchPages}
          onSave={save}
        />
      </FoxPageContent>
    </Content>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BuilderWindowSetting);
