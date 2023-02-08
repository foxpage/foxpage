import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import * as API from '@/apis/application';
import { RecordActionType } from '@/constants/index';
import { VariableTypes } from '@/constants/variable';
import { getBusinessI18n } from '@/foxI18n/index';
import { VariableActionType } from '@/reducers/applications/detail/file/variables';
import { getRelation } from '@/sagas/builder/services';
import * as RECORD_ACTIONS from '@/store/actions/record';
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
import { errorToast } from '@/utils/error-toast';

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

    errorToast(res, fetchFailed);
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
  const { realInvalids, relation } = yield getRelation(editVariable.content as any, [] as RelationDetails, {
    applicationId,
  });

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
  if (!!params?.pageContentId) {
    _params = {
      ..._params,
      pageContentId: params.pageContentId,
    };
  }

  const editStatus = !!editVariable.id;
  const res = yield call(editStatus ? API.updateVariables : API.addVariables, _params);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);
    if (editStatus) {
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.VARIABLE_UPDATE, [_params], {
          save: true,
          applicationId: _params.applicationId,
          contentId: _params.content?.id,
        }),
      );
    } else {
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.VARIABLE_CREATE, [_params], {
          save: true,
          applicationId: _params.applicationId,
          contentId: res.data.contentId,
        }),
      );
    }
    yield put(ACTIONS.openEditDrawer(false));

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, saveFailed);
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

    errorToast(res, fetchDetailFailed);
  }
}

function* handleDeleteVariable(action: VariableActionType) {
  const { params, cb } = action.payload as { params: VariableDeleteParams; cb?: () => void };
  const res = yield call(API.deleteVariable, params);

  const {
    global: { deleteFailed, deleteSuccess },
  } = getBusinessI18n();

  const { variable, ...rest } = params;
  if (res.code === 200) {
    message.success(deleteSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.VARIABLE_REMOVE, [rest], {
        save: true,
        applicationId: params.applicationId,
        contentId: variable?.contentId,
      }),
    );
    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handlePublishVariable(action: VariableActionType) {
  const { params, cb } = action.payload as { params: VariablePublishParams; cb?: () => void };
  const res = yield call(API.publish, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(publishSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.VARIABLE_PUBLISH, [params], {
        save: true,
        applicationId: params.applicationId,
        contentId: params.contentId,
      }),
    );
    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, publishFailed);
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
    errorToast(res, isOnline ? revokeFailed : commitFailed);
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
