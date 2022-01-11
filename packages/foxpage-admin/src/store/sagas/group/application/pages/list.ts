import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/pages';
import { defaultSuffix } from '@/pages/common/constant/FileType';
import * as ACTIONS from '@/store/actions/group/application/pages/list';
import { ApplicationPageActionType } from '@/store/reducers/group/application/pages/list';
import { FileDeleteParams, FileSearchParams, FileUpdateParams } from '@/types/application/file';

function* fetchApplicationPages(action: ApplicationPageActionType) {
  const { applicationId, page, size } = action.payload as FileSearchParams;
  yield put(ACTIONS.updateLoading(true));
  const rs = yield call(API.getApplicationPages, {
    applicationId,
    page,
    size,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.updateLoading(false));
    yield put(ACTIONS.pushApplicationPages(rs.data || [], rs.pageInfo));
  } else {
    message.error(rs.msg || 'Fetch page list failed.');
  }
}

function* handleUpdatePage(action: ApplicationPageActionType) {
  const { file, applicationId, onSuccess } = action.payload as FileUpdateParams;

  if (!file.name) {
    message.warning('Please input name');
    return;
  }
  if (!file.type) {
    message.warning('Please select type');
    return;
  }

  const rs = yield call(API.updatePage, {
    id: file.id,
    name: file.name,
    folderId: file.folderId,
    applicationId,
    tags: file.tags,
    suffix: file.suffix || defaultSuffix[file.type],
    type: file.type,
  });
  if (rs.code === 200) {
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || 'Fetch list failed');
  }
}

function* handleDeletePage(action: ApplicationPageActionType) {
  const { id, applicationId, onSuccess } = action.payload as FileDeleteParams;

  const rs = yield call(API.deletePages, {
    id,
    applicationId,
    status: true,
  });
  if (rs.code === 200) {
    message.success('Delete succeed');
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || 'Delete failed');
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationPages), fetchApplicationPages);
  yield takeLatest(getType(ACTIONS.updatePage), handleUpdatePage);
  yield takeLatest(getType(ACTIONS.deletePage), handleDeletePage);
}

export default function* rootSaga() {
  yield all([watch()]);
}
