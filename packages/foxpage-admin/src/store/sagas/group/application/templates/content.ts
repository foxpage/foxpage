import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/templates';
import { getBusinessI18n } from '@/pages/locale';
import * as ACTIONS from '@/store/actions/group/application/templates/content';
import { PageContentActionType } from '@/store/reducers/group/application/pages/content';
import {
  ContentDeleteParams,
  ContentSearchParams,
  ContentType,
  ContentUpdateParams,
} from '@/types/application/content';

function* handleFetchPageContents(action: PageContentActionType) {
  const params = action.payload as ContentSearchParams;
  yield put(ACTIONS.updateLoading(true));
  const {
    content: { fetchFailed },
  } = getBusinessI18n();
  const rs = yield call(API.getTemplateContents, params);

  if (rs.code === 200) {
    yield put(ACTIONS.updateLoading(false));
    yield put(ACTIONS.pushTemplateContentList(rs.data || [], rs.pageInfo));
  } else {
    message.error(rs.msg || fetchFailed);
  }
}

function* handleUpdatePageContent(action: PageContentActionType) {
  const { applicationId, content, onSuccess } = action.payload as ContentUpdateParams;
  const {
    global: { nameError, fetchListFailed },
  } = getBusinessI18n();
  if (!content.title) {
    message.warning(nameError);
    return;
  }

  const rs = yield call(API.updateTemplateContent, {
    applicationId,
    ...content,
  } as ContentType);
  if (rs.code === 200) {
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* handleDeletePageContent(action: PageContentActionType) {
  const { id, applicationId, onSuccess } = action.payload as ContentDeleteParams;
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const rs = yield call(API.deleteTemplateContent, {
    id,
    applicationId,
    status: true,
  });
  if (rs.code === 200) {
    message.success(deleteSuccess);
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTemplateContentList), handleFetchPageContents);
  yield takeLatest(getType(ACTIONS.deleteTemplateContent), handleDeletePageContent);
  yield takeLatest(getType(ACTIONS.updateTemplateContent), handleUpdatePageContent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
