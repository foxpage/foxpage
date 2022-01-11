import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/content';
import { getAppDetail } from '@/apis/group/application/list';
import { fetchFileDetail } from '@/apis/group/file';
import * as API from '@/apis/group/project/content';
import { commitToStore, offlineFromStore } from '@/apis/store/list';
import { FileTypeEnum } from '@/constants/index';
import { ProjectContentActionType } from '@/reducers/group/project/content';
import { store } from '@/store/index';
import {
  GoodsCommitParams,
  GoodsOfflineParams,
  ProjectContentDeleteParams,
  ProjectContentSearchParams,
  ProjectFileDetailFetchParams,
} from '@/types/index';

function* handleFetchList(action: ProjectContentActionType) {
  const { applicationId, fileId, fileType } = action.payload as ProjectContentSearchParams;

  yield put(ACTIONS.updateFetchLoading(true));
  const res = yield call(fileType === 'page' ? API.fetchPageContents : API.fetchTemplateContents, {
    applicationId,
    fileId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushContentList(res.data));
  } else {
    message.error('Fetch content list failed');
  }

  yield put(ACTIONS.updateFetchLoading(false));
}

function* save(action: ProjectContentActionType) {
  const { applicationId, fileId, fileType } = action.payload as ProjectContentSearchParams;

  const state = store.getState().group.project.content;
  const content = state.editContent;

  if (!content.title) {
    message.warn('Please input name');
    return;
  }
  const localesTag = content.tags ? content.tags.filter(item => item.locale) : [];
  if (localesTag.length === 0) {
    message.warn('Please select locale');
    return;
  }

  yield put(ACTIONS.setSaveLoading(true));
  const saveApi = content.id
    ? fileType === FileTypeEnum.page
      ? API.updatePageContent
      : API.updateTemplateContent
    : fileType === FileTypeEnum.page
    ? API.addPageContent
    : API.addTemplateContent;
  const res = yield call(saveApi, {
    ...content,
    fileId,
    applicationId,
  });
  if (res.code === 200) {
    message.success('Save succeed');
    yield put(ACTIONS.updateEditDrawerOpen(false));
    yield put(ACTIONS.fetchContentList({ applicationId, fileId, fileType }));
  } else {
    message.error('Save failed');
  }

  yield put(ACTIONS.setSaveLoading(false));
}

function* deleteContent(action: ProjectContentActionType) {
  const { applicationId, id, fileId, fileType } = action.payload as ProjectContentDeleteParams;

  const res = yield call(fileType === 'page' ? API.deletePageContent : API.deleteTemplateContent, {
    applicationId,
    id,
    status: true,
  });
  if (res.code === 200) {
    message.success('Delete succeed');
    yield put(ACTIONS.fetchContentList({ applicationId, fileId, fileType }));
  } else {
    message.error('Delete failed');
  }

  yield put(ACTIONS.updateFetchLoading(false));
}

function* fetchLocales(action: ProjectContentActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const res = yield call(getAppDetail, {
    applicationId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushLocales(res.data.locales));
  } else {
    message.error('Fetch locales failed');
  }
}

function* handleCommitFileToStore(action: ProjectContentActionType) {
  const { id, applicationId, type, intro, onSuccess } = action.payload as GoodsCommitParams;
  const rs = yield call(commitToStore, {
    id,
    applicationId,
    type,
    intro,
  });
  if (rs.code === 200) {
    message.success('Commit succeed');
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || 'Commit failed');
  }
}

function* handleOfflineFileToStore(action: ProjectContentActionType) {
  const { id, applicationId, onSuccess } = action.payload as GoodsOfflineParams;
  const rs = yield call(offlineFromStore, {
    id,
    applicationId,
  });
  if (rs.code === 200) {
    message.success('Revoke succeed');
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || 'Revoke failed');
  }
}

function* handleFetchFileDetail(action: ProjectContentActionType) {
  const { applicationId, ids } = action.payload as ProjectFileDetailFetchParams;
  yield put(ACTIONS.updateFetchLoading(true));
  const rs = yield call(fetchFileDetail, {
    applicationId,
    ids,
  });
  if (rs.code === 200 && rs.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(rs.data[0]));
  } else {
    message.error(rs.msg || 'Fetch file detail failed');
  }
  yield put(ACTIONS.updateFetchLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchContentList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveContent), save);
  yield takeLatest(getType(ACTIONS.deleteContent), deleteContent);
  yield takeLatest(getType(ACTIONS.fetchLocales), fetchLocales);
  yield takeLatest(getType(ACTIONS.commitFileToStore), handleCommitFileToStore);
  yield takeLatest(getType(ACTIONS.offlineFileFromStore), handleOfflineFileToStore);
  yield takeLatest(getType(ACTIONS.fetchFileDetail), handleFetchFileDetail);
}

export default function* rootSaga() {
  yield all([watch()]);
}
