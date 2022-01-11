import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import * as API from '@/apis/group/application/variable';
import { VariableTypes } from '@/pages/common/constant/VariableFile';
import { searchVariableRelation } from '@/services/builder';
import { store } from '@/store/index';
import { VariableActionType } from '@/store/reducers/builder/variable';
import VariableType, { VariableDeleteParams, VariableSaveParams } from '@/types/application/variable';
import { PaginationInfo } from '@/types/common';
import { isNameError } from '@/utils/error';

function* getVariables(action: VariableActionType) {
  const { applicationId } = store.getState().builder.page;
  const { folderId } = action.payload as { folderId?: string };

  yield put(ACTIONS.setLoadingStatus(true));
  const params: any = {
    applicationId,
    page: 1,
    size: 1000,
  };
  if (folderId) {
    params.folderId = folderId;
  }
  const res = yield call(API.getVariables, params);
  if (res.code === 200) {
    yield put(ACTIONS.pushVariables(res.data, res.pageInfo));
    yield put(ACTIONS.setLoadingStatus(false));
  } else {
    message.error('Get variable failed');
  }
}

function* getApplicationVariables(action: VariableActionType) {
  const { applicationId, pageInfo } = action.payload as {
    applicationId: string;
    pageInfo?: PaginationInfo;
  };

  yield put(ACTIONS.setLoadingStatus(true));
  const params = {
    applicationId,
    page: pageInfo?.page,
    size: pageInfo?.size,
  };

  const res = yield call(API.getApplicationVariables, params);
  if (res.code === 200) {
    yield put(ACTIONS.pushVariables(res.data, res.pageInfo));
    yield put(ACTIONS.setLoadingStatus(false));
  } else {
    message.error('Get variable failed');
  }
}

function* saveVariables(action: VariableActionType) {
  const { applicationId, folderId, successCb } = action.payload as VariableSaveParams;
  const editVariable = _.cloneDeep(store.getState().builder.variable.editVariable);
  if (isNameError(editVariable?.name)) {
    return null;
  }

  const schemas = editVariable.content.schemas;
  schemas[0].name = editVariable.name;

  const oldRelation = editVariable.content.relation || {};

  const { relation, hasError } = yield searchVariableRelation({
    applicationId,
    folderId,
    props: schemas[0].props || {},
    oldRelation,
  });
  if (hasError) {
    return;
  }

  //variable type = data.function.call
  if (VariableTypes[1] === schemas[0].type) {
    editVariable.content.relation = { ...oldRelation, ...relation };
  } else {
    editVariable.content.relation = relation;
  }

  delete editVariable.relations;
  const res = yield call(editVariable.id ? API.updateVariables : API.addVariables, {
    ...editVariable,
    applicationId,
    folderId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.updateVariableEditDrawerOpen());
    if (typeof successCb === 'function') {
      successCb();
    } else {
      yield put(ACTIONS.getVariables(folderId));
    }
  } else {
    message.error(res.msg || 'Save variable failed');
  }
}

function* getBuildVersion(action: VariableActionType) {
  const { file, applicationId } = action.payload as { file: VariableType; applicationId: string };
  const res = yield call(API.getVariableBuildVersion, {
    applicationId,
    id: file.contentId,
  });
  if (res.code === 200) {
    yield put(
      ACTIONS.pushVariableBuilderVersion({ ...file, content: res.data.content, relations: res.data.relations }),
    );
  } else {
    message.error('Fetch variable detail failed');
  }
}

function* deleteVariable(action: VariableActionType) {
  const { applicationId, folderId, fileId, successCb } = action.payload as VariableDeleteParams;
  const res = yield call(API.deleteVariable, {
    applicationId,
    id: fileId,
    status: true,
  });
  if (res.code === 200) {
    if (typeof successCb === 'function') {
      successCb();
    } else {
      yield put(ACTIONS.getVariables(folderId));
    }
  } else {
    message.error('Delete variable failed');
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.getApplicationVariables), getApplicationVariables);
  yield takeLatest(getType(ACTIONS.getVariables), getVariables);
  yield takeLatest(getType(ACTIONS.saveVariable), saveVariables);
  yield takeLatest(getType(ACTIONS.getVariableBuilderVersion), getBuildVersion);
  yield takeLatest(getType(ACTIONS.deleteVariable), deleteVariable);
}

export default function* rootSaga() {
  yield all([watch()]);
}
