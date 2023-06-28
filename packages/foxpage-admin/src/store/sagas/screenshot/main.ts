import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/screenshot';
import { getScreenshot } from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ScreenshotActionType } from '@/store/reducers/screenshot/main';
import { ScreenshotFetchedRes, ScreenshotFetchParams, ScreenshotPicture } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchList(action: ScreenshotActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: ScreenshotFetchParams };
  const result: ScreenshotFetchedRes = yield call(getScreenshot, params);
  if (result.code === 200) {
    // mapped
    const pictures: Record<string, ScreenshotPicture[]> = {};
    Object.keys(result.data).forEach((typeId) => {
      const list = result.data[typeId];
      let _pictures: ScreenshotPicture[] = [];
      list.forEach((item) => {
        if (item.pictures && item.pictures.length > 0) {
          _pictures = _pictures.concat(item.pictures);
        }
      });
      pictures[typeId] = _pictures.sort((a, b) => a.sort - b.sort);
    });
    yield put(ACTIONS.pushScreenshots(pictures));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(result, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchScreenshots), handleFetchList);
}

export default function* rootSaga() {
  yield all([watch()]);
}
