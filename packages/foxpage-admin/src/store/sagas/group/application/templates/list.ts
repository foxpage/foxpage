import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/templates';
import { defaultSuffix } from '@/pages/common/constant/FileType';
import * as ACTIONS from '@/store/actions/group/application/templates/list';
import { ApplicationTemplateActionType } from '@/store/reducers/group/application/templates/list';
import { FileDeleteParams, FileSearchParams, FileUpdateParams } from '@/types/application/file';

function* fetchApplicationTemplates(action: ApplicationTemplateActionType) {
  const { applicationId, page, size } = action.payload as FileSearchParams;
  yield put(ACTIONS.updateLoading(true));
  const rs = yield call(API.getApplicationTemplates, {
    applicationId,
    page,
    size,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.updateLoading(false));
    yield put(ACTIONS.pushApplicationTemplates(rs.data || [], rs.pageInfo));
  } else {
    message.error(rs.msg || 'Fetch page list failed.');
  }
}

function* handleUpdateTemplate(action: ApplicationTemplateActionType) {
  const { file, applicationId, onSuccess } = action.payload as FileUpdateParams;

  if (!file.name) {
    message.warning('Please input name');
    return;
  }
  if (!file.type) {
    message.warning('Please select type');
    return;
  }

  const rs = yield call(API.updateTemplate, {
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

function* handleDeleteTemplate(action: ApplicationTemplateActionType) {
  const { id, applicationId, onSuccess } = action.payload as FileDeleteParams;

  const rs = yield call(API.deleteTemplate, {
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
  yield takeLatest(getType(ACTIONS.fetchApplicationTemplates), fetchApplicationTemplates);
  yield takeLatest(getType(ACTIONS.updateTemplate), handleUpdateTemplate);
  yield takeLatest(getType(ACTIONS.deleteTemplate), handleDeleteTemplate);
}

export default function* rootSaga() {
  yield all([watch()]);
}
