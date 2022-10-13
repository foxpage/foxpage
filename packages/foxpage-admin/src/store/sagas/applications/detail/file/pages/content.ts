import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import * as API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import * as PROJECT_API from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPageContentActionType } from '@/reducers/applications/detail/file/pages/content';
import { store } from '@/store/index';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
} from '@/types/index';

function* handleFetchPageContents(action: ApplicationPageContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = action.payload as ProjectContentFetchParams;
  const res = yield call(API.fetchApplicationPageContents, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushPageContentList(res.data || [], res.pageInfo));
  } else {
    const {
      content: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveContent(action: ApplicationPageContentActionType) {
  const { applicationId, fileId } = action.payload as ProjectContentFetchParams;
  const { editContent: content } = store.getState().applications.detail.file.pages.content;
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

  const res = yield call(PROJECT_API.updatePageContent, params);

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.openEditDrawer(false));
    yield put(ACTIONS.fetchPageContentList({ applicationId, fileId }));
  } else {
    message.error(res.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDeleteContent(action: ApplicationPageContentActionType) {
  const { applicationId, id, status, fileId } = action.payload as ProjectContentDeleteParams;
  const res = yield call(PROJECT_API.deletePageContent, {
    applicationId,
    id,
    status,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    yield put(ACTIONS.fetchPageContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handleFetchAuthList(action: ApplicationPageContentActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const res = yield call(AUTH_API.authorizeFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushAuthList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleSaveAuth(action: ApplicationPageContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeAdd, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    message.error(res.msg || addFailed);
  }
}

function* handleDeleteAuth(action: ApplicationPageContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handleFetchUserList(action: ApplicationPageContentActionType) {
  const { params } = action.payload as { params: AuthorizeUserFetchParams };
  const res = yield call(AUTH_API.authorizeUserFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushUserList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchPageContentList), handleFetchPageContents);
  yield takeLatest(getType(ACTIONS.saveContent), handleSaveContent);
  yield takeLatest(getType(ACTIONS.deleteContent), handleDeleteContent);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
