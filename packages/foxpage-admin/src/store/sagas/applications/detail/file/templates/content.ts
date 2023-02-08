import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/content';
import * as API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import { clonePage } from '@/apis/builder';
import * as PROJECT_API from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationTemplateContentActionType } from '@/reducers/applications/detail/file/templates/content';
import { store } from '@/store/index';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  ProjectContentOfflineParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchTemplateContents(action: ApplicationTemplateContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = action.payload as ProjectContentFetchParams;
  const res = yield call(API.fetchApplicationTemplateContents, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushTemplateContentList(res.data || [], res.pageInfo));
  } else {
    const {
      content: { fetchFailed },
    } = getBusinessI18n();

    errorToast(res, fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveContent(action: ApplicationTemplateContentActionType) {
  const { applicationId, fileId } = action.payload as ProjectContentFetchParams;
  const { editContent: content } = store.getState().applications.detail.file.templates.content;
  const {
    global: { nameError, saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (!content?.title) {
    message.warn(nameError);
    return;
  }

  yield put(ACTIONS.updateSaveLoading(true));

  let params: any = {
    ...content,
    extendId: !content.extendId ? undefined : content.extendId,
    fileId,
    applicationId,
  };
  if (typeof content?.oneLocale === 'undefined')
    params = {
      ...params,
      oneLocale: true,
    };

  const res = yield call(PROJECT_API.updateTemplateContent, params);

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.openEditDrawer(false));
    yield put(ACTIONS.fetchTemplateContentList({ applicationId, fileId }));
  } else {
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleOfflineContent(action: ApplicationTemplateContentActionType) {
  const { applicationId, id, fileId } = action.payload as ProjectContentOfflineParams;
  const res = yield call(PROJECT_API.offlineProjectTemplateContent, {
    applicationId,
    id,
  });

  const {
    global: { offlineSuccess, offlineFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(offlineSuccess);

    yield put(ACTIONS.fetchTemplateContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    errorToast(res, offlineFailed);
  }
}

function* handleCopyContent(action: ApplicationTemplateContentActionType) {
  const { params, cb } = action.payload as { params: ProjectContentCopyParams; cb?: () => void };
  const { applicationId, fileId, sourceContentId, targetContentLocales } = params;
  const res = yield call(clonePage, {
    applicationId,
    sourceContentId,
    targetContentLocales,
  });

  const {
    global: { copySuccess, copyFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(copySuccess);

    if (typeof cb === 'function') cb();

    yield put(ACTIONS.fetchTemplateContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    errorToast(res, copyFailed);
  }
}

function* handleDeleteContent(action: ApplicationTemplateContentActionType) {
  const { applicationId, id, status, fileId } = action.payload as ProjectContentDeleteParams;
  const res = yield call(PROJECT_API.deleteTemplateContent, {
    applicationId,
    id,
    status,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    yield put(ACTIONS.fetchTemplateContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchAuthList(action: ApplicationTemplateContentActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const res = yield call(AUTH_API.authorizeFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushAuthList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleSaveAuth(action: ApplicationTemplateContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeAdd, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    errorToast(res, addFailed);
  }
}

function* handleDeleteAuth(action: ApplicationTemplateContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchUserList(action: ApplicationTemplateContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeUserFetchParams; cb?: (userList) => void };
  const res = yield call(AUTH_API.authorizeUserFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushUserList(res.data || []));

    if (typeof cb === 'function') cb(res.data);
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTemplateContentList), handleFetchTemplateContents);
  yield takeLatest(getType(ACTIONS.saveContent), handleSaveContent);
  yield takeLatest(getType(ACTIONS.offlineContent), handleOfflineContent);
  yield takeLatest(getType(ACTIONS.copyContent), handleCopyContent);
  yield takeLatest(getType(ACTIONS.deleteContent), handleDeleteContent);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
