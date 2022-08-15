import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, message, Spin } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/component';
import { OperationDrawer } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { Component } from '@/types/component';

import BasicInfoPanel from './BasicInfoPanel';

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
  const { applicationId } = useParams<{ applicationId: string }>();
  const [category, setCategory] = useState<Component['category'] | undefined>(
    props.editorState?.data?.category,
  );
  const { loading, editorState, categories, closeDrawer, save, fetchCategories } = props;
  const { status, data } = editorState;
  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, setting, category: i18n } = locale.business;

  useEffect(() => {
    if (!status) {
      setCategory(undefined);
      fetchCategories(applicationId);
    }
  }, [status]);

  useEffect(() => {
    setCategory(props.editorState?.data?.category);
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

  const onSave = () => {
    if (category && checker(category)) {
      save({
        applicationId,
        type: 'component',
        setting: [
          {
            category,
            id: editorState?.data.id,
            name: editorState?.data.name || '',
            status: false,
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
      onClose={() => closeDrawer(false, null)}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={onSave}>
          {global.apply}
        </Button>
      }>
      <Spin spinning={loading}>
        <BasicInfoPanel key={status} category={category} categories={categories} onChange={setCategory} />
      </Spin>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
