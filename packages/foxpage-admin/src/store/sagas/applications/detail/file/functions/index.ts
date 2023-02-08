import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import * as API from '@/apis/application';
import { RecordActionType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { FunctionActionType } from '@/reducers/applications/detail/file/functions';
import { getRelation } from '@/sagas/builder/services';
import * as RECORD_ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import {
  FuncDeleteParams,
  FuncDeleteRes,
  FuncFetchParams,
  FuncFetchRes,
  FuncNewRes,
  FuncPublishParams,
  FuncSaveParams,
  RelationDetails,
} from '@/types/index';
import { errorToast, nameErrorCheck, objectEmptyCheck } from '@/utils/index';

function* handleFetchList(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = actions.payload as { params: FuncFetchParams };
  const { folderId, type } = params;
  const { scope } = store.getState().applications.detail.file.functions;
  const res: FuncFetchRes =
    !folderId && !type
      ? yield call(API.fetchAppFunctions, { ...params, scope })
      : yield call(API.fetchFunctions, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushList(res.data, res.pageInfo));
  } else {
    const {
      function: { fetchFailed },
    } = getBusinessI18n();

    errorToast(res, fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveFunction(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as { params: FuncSaveParams; cb?: () => void };

  if (nameErrorCheck(params?.name)) {
    return;
  }

  if (params.content) {
    const { applicationId } = store.getState().applications.detail.settings.app;
    const { realInvalids, relation } = yield getRelation(params.content as any, [] as RelationDetails, {
      applicationId: params?.applicationId || applicationId,
    });

    if (!objectEmptyCheck(realInvalids)) {
      yield put(ACTIONS.updateLoading(false));
      return;
    }

    params.content.relation = relation;
  }

  let _params: any = {
    applicationId: params.applicationId,
    folderId: params.folderId,
    name: params.name,
    content: params.content,
  };
  if (!!params?.id) {
    _params = {
      ..._params,
      id: params.id,
    };
  }
  if (!!params?.pageContentId) {
    _params = {
      ..._params,
      pageContentId: params.pageContentId,
    };
  }

  const editStatus = !!params?.id;
  const res: FuncNewRes = yield call(editStatus ? API.updateFunction : API.addFunction, _params);

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);
    if (editStatus) {
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.FUN_UPDATE, [_params], {
          save: true,
          applicationId: params.applicationId,
          contentId: params.content?.id,
        }),
      );
    } else {
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.FUN_CREATE, [_params], {
          save: true,
          applicationId: params.applicationId,
          contentId: res.data.contentId,
        }),
      );
    }
    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteFunction(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as {
    params: FuncDeleteParams;
    cb?: () => void;
  };
  const { fun, ...rest } = params;
  const res: FuncDeleteRes = yield call(API.deleteFunction, rest);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.FUN_REMOVE, [params], {
        save: true,
        applicationId: params.applicationId,
        contentId: fun?.contentId,
      }),
    );
    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handlePublishFunction(action: FunctionActionType) {
  const { params, cb } = action.payload as { params: FuncPublishParams; cb?: () => void };
  const res = yield call(API.publishFunction, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(publishSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.FUN_PUBLISH, [params], {
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

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveFunction), handleSaveFunction);
  yield takeLatest(getType(ACTIONS.deleteFunction), handleDeleteFunction);
  yield takeLatest(getType(ACTIONS.publishFunction), handlePublishFunction);
}

export default function* rootSaga() {
  yield all([watch()]);
}
