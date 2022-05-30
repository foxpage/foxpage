import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as MORE_ACTIONS from '@/actions/builder/more';
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
import { getBusinessI18n } from '@/pages/locale';
import { store } from '@/store/index';
import { PageActionType } from '@/store/reducers/builder/page';
import { FileDetailFetchParams } from '@/types/application/file';
import { PageParam } from '@/types/builder';

function* fetchList(action: PageActionType) {
  yield put(ACTIONS.setLoadingStatus(true));

  const {
    builder: { fetchCatalogFailed },
  } = getBusinessI18n();
  const { applicationId, folderId = '' } = action.payload as PageParam;

  const res = yield call(API.fetchFolderCatalog, {
    applicationId,
    id: folderId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushPageList(res.data));
  } else {
    message.error(res.msg || fetchCatalogFailed);
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
    put(MORE_ACTIONS.clearAll()),
    put(ACTIONS.setLocale(locale || '')),
    put(ACTIONS.setContentId({ applicationId, folderId, fileId, contentId, fileType })),
    put(setSelectedComponent()),
    put(clearNextSteps()),
    put(clearLastSteps()),
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
