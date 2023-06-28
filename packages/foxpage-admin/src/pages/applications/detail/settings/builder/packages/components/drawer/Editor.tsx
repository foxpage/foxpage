import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, message, Spin, Tabs as AntTabs } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/component';
import { OperationDrawer } from '@/components/index';
import { JSONCodeEditor } from '@/pages/components/common';
import { GlobalContext } from '@/pages/system';
import { Component } from '@/types/index';

import BasicInfoPanel from './BasicInfoPanel';

const { TabPane } = AntTabs;

const Tabs = styled(AntTabs)`
  &.ant-tabs {
    .ant-tabs-nav {
      margin-bottom: 0;
      padding-left: 16px;
    }
  }
`;

const EditorContainer = styled.div`
  height: 700px;
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.settings.builder.components.loading,
  editorState: store.applications.detail.settings.builder.components.editor,
  categories: store.applications.detail.settings.builder.components.categories,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateEditorVisible,
  save: ACTIONS.saveCategory,
  fetchCategories: ACTIONS.fetchCategories,
};

type DrawerProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Editor: React.FC<DrawerProp> = (props) => {
  const [category, setCategory] = useState<Component['category'] | undefined>(
    props.editorState?.data?.category,
  );
  const [defaultValue, setDefaultValue] = useState<Record<string, any> | undefined>(
    props.editorState?.data?.defaultValue,
  );
  const [tabKey, setTabKey] = useState('1');
  const { loading, editorState, categories, closeDrawer, save, fetchCategories } = props;
  const { status, data } = editorState;

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, setting, category: i18n } = locale.business;

  useEffect(() => {
    setTabKey('1');
  }, []);

  useEffect(() => {
    if (!status) {
      setCategory(undefined);
      fetchCategories(applicationId);
    }
  }, [status]);

  useEffect(() => {
    setCategory(props.editorState?.data?.category);
    setDefaultValue(props.editorState?.data?.defaultValue);
  }, [props.editorState]);

  const checker = (params?: Component['category']) => {
    const { name, categoryName, groupName } = params || {};
    if (!name) {
      message.warning(i18n.nameEmptyTips);
      return false;
    }
    if (!categoryName) {
      message.warning(i18n.levelOneEmptyTips);
      return false;
    }
    if (!groupName) {
      message.warning(i18n.levelTwoEmptyTips);
      return false;
    }

    return true;
  };

  const onClose = () => {
    setTabKey('1');
    setDefaultValue(undefined);

    setTimeout(() => closeDrawer(false, null), 50);
  };

  const onSave = () => {
    if (category && checker(category)) {
      save({
        applicationId,
        type: editorState.data.type,
        setting: [
          {
            category,
            id: editorState?.data.id,
            idx: editorState?.data.idx,
            name: editorState?.data.name || '',
            status: editorState?.data.status || false,
            defaultValue,
          },
        ],
      });
    }
  };

  return (
    <OperationDrawer
      maskClosable={false}
      open={status}
      title={data?.category?.categoryName ? global.edit : global.add + setting.componentBar}
      onClose={onClose}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={onSave}>
          {global.apply}
        </Button>
      }>
      <Tabs activeKey={tabKey} onChange={setTabKey}>
        <TabPane key="1" tab={setting.basicInfo}>
          <Spin spinning={loading}>
            <BasicInfoPanel key={status} category={category} categories={categories} onChange={setCategory} />
          </Spin>
        </TabPane>
        <TabPane key="2" tab={global.props}>
          <EditorContainer>
            <JSONCodeEditor value={defaultValue || {}} onChange={setDefaultValue} />
          </EditorContainer>
        </TabPane>
      </Tabs>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
