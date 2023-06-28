import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import * as API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import { clonePage } from '@/apis/builder';
import * as PROJECT_API from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPageContentActionType } from '@/reducers/applications/detail/file/pages/content';
import { fetchScreenshots } from '@/store/actions/screenshot';
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
  ProjectContentSaveAsBaseParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchPageContents(action: ApplicationPageContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = action.payload as ProjectContentFetchParams;
  const res = yield call(API.fetchApplicationPageContents, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushPageContentList(res.data || [], res.pageInfo));
    yield put(
      fetchScreenshots({
        applicationId: params.applicationId,
        type: 'content',
        typeIds: res.data.map((item) => item.id),
      }),
    );
  } else {
    const {
      content: { fetchFailed },
    } = getBusinessI18n();

    errorToast(res, fetchFailed);
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
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleOfflineContent(action: ApplicationPageContentActionType) {
  const { applicationId, id, fileId } = action.payload as ProjectContentOfflineParams;
  const res = yield call(PROJECT_API.offlineProjectPageContent, {
    applicationId,
    id,
  });

  const {
    global: { offlineSuccess, offlineFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(offlineSuccess);

    yield put(ACTIONS.fetchPageContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    errorToast(res, offlineFailed);
  }
}

function* handleCopyContent(action: ApplicationPageContentActionType) {
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

    yield put(ACTIONS.fetchPageContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    errorToast(res, copyFailed);
  }
}

function* handleSaveAsBaseContent(action: ApplicationPageContentActionType) {
  const { applicationId, contentId, fileId } = action.payload as ProjectContentSaveAsBaseParams;
  const res = yield call(clonePage, {
    applicationId,
    sourceContentId: contentId,
    targetContentLocales: [],
    includeBase: true,
  });

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.fetchPageContentList({ applicationId: applicationId || '', fileId: fileId || '' }));
  } else {
    errorToast(res, saveFailed);
  }
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
    errorToast(res, deleteFailed);
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

    errorToast(res, fetchListFailed);
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

    errorToast(res, addFailed);
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
    errorToast(res, deleteFailed);
  }
}

function* handleFetchUserList(action: ApplicationPageContentActionType) {
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
  yield takeLatest(getType(ACTIONS.fetchPageContentList), handleFetchPageContents);
  yield takeLatest(getType(ACTIONS.saveContent), handleSaveContent);
  yield takeLatest(getType(ACTIONS.offlineContent), handleOfflineContent);
  yield takeLatest(getType(ACTIONS.copyContent), handleCopyContent);
  yield takeLatest(getType(ACTIONS.saveAsBaseContent), handleSaveAsBaseContent);
  yield takeLatest(getType(ACTIONS.deleteContent), handleDeleteContent);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
