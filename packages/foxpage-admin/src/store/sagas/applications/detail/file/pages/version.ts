import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/application/page/version';
import { FileType } from '@/constants/global';
import { getBusinessI18n } from '@/foxI18n/index';
import * as ACTIONS from '@/store/actions/applications/detail/file/pages/version';
import { ApplicationPageHistoryActionType } from '@/store/reducers/applications/detail/file/pages/version';
import { ContentVersionDataFetchParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

const apis = {
  [FileType.page]: API.fetchPageVersions,
  [FileType.template]: API.fetchTemplateVersions,
  [FileType.block]: API.fetchBlockVersions,
};

function* fetchVersions(action: ApplicationPageHistoryActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: ContentVersionDataFetchParams };
  const { fileType, ...rest } = params;
  const res = yield call(apis[fileType || FileType.page], rest);

  if (res.code === 200) {
    yield put(ACTIONS.pushVersions(res));
  } else {
    const {
      history: { fetchVersionsFailed },
    } = getBusinessI18n();

    errorToast(res, fetchVersionsFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchVersions), fetchVersions);
}

export default function* rootSaga() {
  yield all([watch()]);
}
