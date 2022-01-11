import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/page';
import {
  clearLastSteps,
  clearNextSteps,
  pushSsrHtml,
  saveToServer,
  setSelectedComponent,
} from '@/actions/builder/template';
import * as API from '@/apis/builder/catalog';
import { fetchFileDetail } from '@/apis/group/file';
import { store } from '@/store/index';
import { PageActionType } from '@/store/reducers/builder/page';
import { FileDetailFetchParams } from '@/types/application/file';
import { PageParam } from '@/types/builder';

function* fetchList(action: PageActionType) {
  const { applicationId, folderId = '', fileId, contentId, fileType } = action.payload as PageParam;
  yield put(ACTIONS.setLoadingStatus(true));
  if (!contentId && !fileId) {
    const res = yield call(API.fetchFolderCatalog, {
      applicationId,
      id: folderId,
    });
    if (res.code === 200) {
      yield put(ACTIONS.pushPageList(res.data.files));
    } else {
      message.error('Fetch catalog failed');
    }
  } else if (fileId) {
    const res = yield call(fileType === 'page' ? API.fetchPagesCatalog : API.fetchTemplatesCatalog, {
      applicationId,
      id: fileId,
    });
    if (res.code === 200) {
      yield put(ACTIONS.pushPageList(res.data));
    } else {
      message.error('Fetch catalog failed');
    }
  }
  yield put(ACTIONS.setLoadingStatus(false));
}

function* selectContent(action: PageActionType) {
  const { applicationId, folderId, fileId, contentId, locale, fileType } = action.payload as PageParam;
  const editStatus = store.getState().builder.template.editStatus;
  if (editStatus) {
    yield put(saveToServer(applicationId, () => {}, true));
  }
  yield all([
    put(ACTIONS.setLocale(locale || '')),
    put(setSelectedComponent()),
    put(clearNextSteps()),
    put(clearLastSteps()),
    put(ACTIONS.setContentId({ applicationId, folderId, fileId, contentId, fileType })),
    put(pushSsrHtml('')),
  ]);
}

function* handleFetchFileDetail(action: PageActionType) {
  const { applicationId, ids } = action.payload as FileDetailFetchParams;
  yield put(ACTIONS.setLoadingStatus(true));
  const rs = yield call(fetchFileDetail, {
    applicationId,
    ids,
  });
  if (rs.code === 200 && rs.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(rs.data[0]));
  }
  yield put(ACTIONS.setLoadingStatus(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.selectContent), selectContent);
  yield takeLatest(getType(ACTIONS.fetchPageList), fetchList);
  yield takeLatest(getType(ACTIONS.fetchFileDetail), handleFetchFileDetail);
}

export default function* rootSaga() {
  yield all([watch()]);
}
