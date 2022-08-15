import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import * as API from '@/apis/application';
import { VariableTypes } from '@/constants/variable';
import { getBusinessI18n } from '@/foxI18n/index';
import { VariableActionType } from '@/reducers/applications/detail/file/variables';
import { getRelation } from '@/sagas/builder/services';
import { store } from '@/store/index';
import {
  GoodsCommitParams,
  RelationDetails,
  VariableDeleteParams,
  VariableEntity,
  VariablePublishParams,
  VariableSaveParams,
  VariablesFetchParams,
} from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';

function* handleFetchList(action: VariableActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: VariablesFetchParams };
  const { folderId, type } = params;
  const { scope } = store.getState().applications.detail.file.variables;
  const res =
    !folderId && !type
      ? yield call(API.fetchAppVariables, { ...params, scope })
      : yield call(API.fetchVariables, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushList(res.data, res.pageInfo));
  } else {
    const {
      variable: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveVariable(action: VariableActionType) {
  const { params, cb } = action.payload as { params: VariableSaveParams; cb?: () => void };
  const { applicationId, folderId } = params;

  const editVariable = _.cloneDeep(store.getState().applications.detail.file.variables.editVariable);
  const schemas = editVariable.content.schemas;
  if (schemas && schemas?.[0]) {
    schemas[0].name = editVariable?.name || '';
  }

  const oldRelation = editVariable.content.relation || {};
  const { realInvalids, relation } = yield getRelation(editVariable.content as any, [] as RelationDetails);

  if (!objectEmptyCheck(realInvalids)) {
    return;
  }

  //variable type = data.function.call
  if (VariableTypes[1] === schemas[0].type) {
    editVariable.content.relation = { ...oldRelation, ...relation };
  } else {
    editVariable.content.relation = relation;
  }

  delete editVariable.relations;

  let _params: any = {
    ...editVariable,
    applicationId,
  };
  if (!!folderId) {
    _params = {
      ..._params,
      folderId,
    };
  }

  const res = yield call(editVariable.id ? API.updateVariables : API.addVariables, _params);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.openEditDrawer(false));

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || saveFailed);
  }
}

function* handleFetchBuildVersion(action: VariableActionType) {
  const { file, applicationId } = action.payload as { file: VariableEntity; applicationId: string };
  const res = yield call(API.getVariableBuildVersion, {
    applicationId,
    id: file.contentId,
  });

  if (res.code === 200) {
    yield put(
      ACTIONS.pushVariableBuilderVersion({
        ...file,
        content: res.data.content,
        relations: res.data.relations,
      }),
    );
  } else {
    const {
      variable: { fetchDetailFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchDetailFailed);
  }
}

function* handleDeleteVariable(action: VariableActionType) {
  const { params, cb } = action.payload as { params: VariableDeleteParams; cb?: () => void };
  const res = yield call(API.deleteVariable, params);

  const {
    global: { deleteFailed, deleteSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handlePublishVariable(action: VariableActionType) {
  const { params, cb } = action.payload as { params: VariablePublishParams; cb?: () => void };
  const rs = yield call(API.publish, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (rs.code === 200) {
    message.success(publishSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(rs.msg || publishFailed);
  }
}

function* handleCommitToStore(action: VariableActionType) {
  const { params, cb } = action.payload as { params: GoodsCommitParams; cb?: () => void };
  const { applicationId, id, type, isOnline } = params;
  const newParams = isOnline
    ? {
        applicationId,
        id,
      }
    : {
        applicationId,
        id,
        type,
      };
  const api: any = isOnline ? API.revokeFromStore : API.commitToStore;
  const res = yield call(api, newParams);

  const {
    global: { commitSuccess, commitFailed, revokeSuccess, revokeFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(isOnline ? revokeSuccess : commitSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || isOnline ? revokeFailed : commitFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.fetchVariableBuilderVersion), handleFetchBuildVersion);
  yield takeLatest(getType(ACTIONS.saveVariable), handleSaveVariable);
  yield takeLatest(getType(ACTIONS.deleteVariable), handleDeleteVariable);
  yield takeLatest(getType(ACTIONS.publishVariable), handlePublishVariable);
  yield takeLatest(getType(ACTIONS.commitToStore), handleCommitToStore);
}

export default function* rootSaga() {
  yield all([watch()]);
}
