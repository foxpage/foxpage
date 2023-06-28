import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { Modal as AntModal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as CONDITION_ACTIONS from '@/actions/applications/detail/file/conditions';
import * as FUNCTION_ACTIONS from '@/actions/applications/detail/file/functions';
import * as VARIABLE_ACTIONS from '@/actions/applications/detail/file/variables';
import * as HEADER_ACTIONS from '@/actions/builder/header';
import * as ACTIONS from '@/actions/builder/main';
import { GlobalContext } from '@/pages/system';
import { PaginationInfo, StructureNode } from '@/types/index';

import { List, Page } from './components/index';

export enum ModalTypeEnum {
  condition = 'condition',
  function = 'function',
  page = 'page',
  variable = 'variable',
}

const Modal = styled(AntModal)`
  .ant-modal-header {
    padding: 16px 24px;
  }
  .ant-modal-content {
    height: 100%;
    .ant-modal-body {
      height: calc(100% - 55px - 53px);
      padding: 0;
      overflow: auto;
    }
  }
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  folderId: store.builder.header.folderId,
  type: store.builder.main.toolbarModalType,
  visible: store.builder.main.toolbarModalVisible,
  conditionLoading: store.applications.detail.file.conditions.loading,
  conditionPageInfo: store.applications.detail.file.conditions.pageInfo,
  conditions: store.applications.detail.file.conditions.list,
  functionLoading: store.applications.detail.file.functions.loading,
  functionPageInfo: store.applications.detail.file.functions.pageInfo,
  functions: store.applications.detail.file.functions.list,
  variableLoading: store.applications.detail.file.variables.loading,
  variablePageInfo: store.applications.detail.file.variables.pageInfo,
  variables: store.applications.detail.file.variables.list,
  mock: store.builder.main.mock,
  pageNode: store.builder.main.pageNode,
});

const mapDispatchToProps = {
  openModal: ACTIONS.updateToolbarModalVisible,
  templateOpenInPage: ACTIONS.templateOpenInPage,
  clearAllCondition: CONDITION_ACTIONS.clearAll,
  deleteCondition: CONDITION_ACTIONS.deleteCondition,
  fetchConditions: CONDITION_ACTIONS.fetchList,
  openConditionEditDrawer: CONDITION_ACTIONS.openEditDrawer,
  updateConditionPageInfo: CONDITION_ACTIONS.updatePaginationInfo,
  clearAllFunction: FUNCTION_ACTIONS.clearAll,
  deleteFunction: FUNCTION_ACTIONS.deleteFunction,
  fetchFunctions: FUNCTION_ACTIONS.fetchList,
  openFunctionEditDrawer: FUNCTION_ACTIONS.openEditDrawer,
  updateFunctionPageInfo: FUNCTION_ACTIONS.updatePaginationInfo,
  openStoreModal: HEADER_ACTIONS.updateStoreModalVisible,
  clearAllVariable: VARIABLE_ACTIONS.clearAll,
  deleteVariable: VARIABLE_ACTIONS.deleteVariable,
  fetchVariables: VARIABLE_ACTIONS.fetchList,
  fetchBuildVersion: VARIABLE_ACTIONS.fetchVariableBuilderVersion,
  openVariableEditDrawer: VARIABLE_ACTIONS.openEditDrawer,
  updateVariablePageInfo: VARIABLE_ACTIONS.updatePaginationInfo,
};

type ToolbarModalModalType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ToolbarModal: React.FC<ToolbarModalModalType> = (props) => {
  const {
    applicationId,
    folderId,
    mock,
    type,
    visible,
    conditionLoading,
    conditionPageInfo,
    conditions,
    functionLoading,
    functionPageInfo,
    functions,
    variableLoading,
    variablePageInfo,
    variables,
    openModal,
    openStoreModal,
    clearAllCondition,
    clearAllFunction,
    clearAllVariable,
    deleteCondition,
    deleteFunction,
    deleteVariable,
    fetchConditions,
    fetchFunctions,
    fetchVariables,
    fetchBuildVersion,
    openConditionEditDrawer,
    openFunctionEditDrawer,
    openVariableEditDrawer,
    updateConditionPageInfo,
    updateFunctionPageInfo,
    updateVariablePageInfo,
    pageNode,
    templateOpenInPage,
  } = props;
  const [title, setTitle] = useState('');
  const [button, setButton] = useState('');
  const [dataSource, setDataSource] = useState<any>();
  const [isPage, setIsPage] = useState(false);
  const [newPageNode, setPageNode] = useState<StructureNode>(pageNode);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder, condition, function: func, variable } = locale.business;

  useEffect(() => {
    setPageNode(pageNode);
  }, [pageNode]);

  useEffect(() => {
    if (type) {
      setIsPage(type === ModalTypeEnum.page);
    }
  }, [type]);

  useEffect(() => {
    const pageInfo: PaginationInfo = {
      page: 1,
      size: 5,
      total: 0,
    };

    if (type === ModalTypeEnum.condition) updateConditionPageInfo(pageInfo);
    if (type === ModalTypeEnum.function) updateFunctionPageInfo(pageInfo);
    if (type === ModalTypeEnum.variable) updateVariablePageInfo(pageInfo);
  }, [type]);

  useEffect(() => {
    if (type === ModalTypeEnum.condition) {
      setTitle(condition.name);
      setButton(condition.add);
      setDataSource(conditions || []);
    }

    if (type === ModalTypeEnum.function) {
      setTitle(func.name);
      setButton(func.add);
      setDataSource(functions || []);
    }

    if (type === ModalTypeEnum.variable) {
      setTitle(variable.name);
      setButton(variable.add);
      setDataSource(variables || []);
    }

    if (type === ModalTypeEnum.page) {
      setTitle(builder.pageSetting);
    }
  }, [type, conditions, functions, variables]);

  const open = useMemo(() => visible && type !== 'variableBind', [visible, type]);

  const loading = useMemo(
    () => ({
      condition: conditionLoading,
      function: functionLoading,
      variable: variableLoading,
    }),
    [conditionLoading, functionLoading, variableLoading],
  );

  const paginationInfo = useMemo(
    () => ({
      condition: conditionPageInfo,
      function: functionPageInfo,
      variable: variablePageInfo,
    }),
    [conditionPageInfo, functionPageInfo, variablePageInfo],
  );

  const handleFetch = useCallback(
    (params) => {
      if (type === ModalTypeEnum.condition) fetchConditions(params);
      if (type === ModalTypeEnum.function) fetchFunctions(params);
      if (type === ModalTypeEnum.variable) fetchVariables(params);
    },
    [type],
  );

  const handleEdit = (editType, entity?: any) => {
    if (type === ModalTypeEnum.condition) {
      openConditionEditDrawer(true, entity, editType);
    }

    if (type === ModalTypeEnum.function) {
      openFunctionEditDrawer(true, entity, editType);
    }

    if (type === ModalTypeEnum.variable) {
      openVariableEditDrawer(true, entity, editType);

      // fetch variable detail info before edit
      if (editType === 'edit' || editType === 'view') fetchBuildVersion(applicationId, entity);
    }
  };

  const handleDelete = (id, params) => {
    if (applicationId && id) {
      const deleteParams = {
        applicationId,
        id,
        status: true,
      };

      if (type === ModalTypeEnum.condition)
        deleteCondition({ ...deleteParams, condition: params.entity }, () => handleFetch(params));
      if (type === ModalTypeEnum.function)
        deleteFunction({ ...deleteParams, fun: params.entity }, () => handleFetch(params));
      if (type === ModalTypeEnum.variable)
        deleteVariable({ ...deleteParams, variable: params.entity }, () => handleFetch(params));
    }
  };

  const handleCancel = () => {
    openModal(false, '');
    clearAllCondition();
    clearAllFunction();
    clearAllVariable();
  };

  const handleOk = () => {
    handleCancel();
  };

  const handleOpenTemplateModal = (value: boolean, target?: string) => {
    openStoreModal(value, target);
    templateOpenInPage(true);
  };

  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      width={isPage ? '400px' : '60%'}
      zIndex={100}
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      style={{ height: 600 }}>
      {isPage ? (
        <Page
          pageNode={newPageNode}
          openModal={handleOpenTemplateModal}
          onPageNodeChange={(data) => setPageNode(data)}
        />
      ) : (
        <List
          applicationId={applicationId}
          button={button}
          folderId={folderId}
          loadingInfo={loading}
          mock={mock}
          paginationInfo={paginationInfo}
          type={type}
          dataSource={dataSource}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onFetch={handleFetch}
        />
      )}
    </Modal>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(ToolbarModal);
