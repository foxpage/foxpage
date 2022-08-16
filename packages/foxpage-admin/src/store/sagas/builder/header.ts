import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import * as API from '@/apis/builder';
import { FileType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { BuilderHeaderActionType } from '@/reducers/builder/header';
import { store } from '@/store/index';
import {
  CatalogContentSelectParams,
  MockNewParams,
  MockPublishParams,
  PageTemplateFetchParams,
} from '@/types/index';

function* handleFetchCatalog(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, folderId = '' } = action.payload as CatalogContentSelectParams;
  const res = yield call(API.fetchCatalog, {
    applicationId,
    id: folderId,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushCatalog(res.data));
  } else {
    const {
      builder: { fetchCatalogFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchCatalogFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSelectContent(action: BuilderHeaderActionType) {
  const {
    applicationId,
    folderId,
    fileId,
    contentId,
    locale,
    fileType,
  } = action.payload as CatalogContentSelectParams;

  yield all([
    put(ACTIONS.updateLocale(locale || '')),
    put(ACTIONS.updateContentInfo({ applicationId, contentId, fileId, folderId, fileType })),
  ]);
}

// dls & mock related
function* handleFetchDsl(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateDSLLoading(true));

  const { fileType } = store.getState().builder.header;
  const { applicationId, ids } = action.payload;

  const res = yield call(fileType === FileType.page ? API.fetchPageDsl : API.fetchTemplateDsl, {
    applicationId,
    ids,
  });

  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushDsl(res.data[0]?.content));
  } else {
    const {
      builder: { fetchDslFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchDslFailed);
  }
  yield put(ACTIONS.updateDSLLoading(false));
}

function* handleSaveMock(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateMockLoading(true));

  // call mock add api
  const { params, cb } = action.payload as { params: MockNewParams; cb: (mockId?: string) => void };
  const { applicationId, content } = params;

  // get specific api & params with different update type
  const mockId = params?.content?.id;
  const api: any = !!mockId ? API.updateMock : API.saveMock;
  const newParams = !mockId
    ? params
    : {
        applicationId,
        id: mockId,
        content,
      };
  const res = yield call(api, newParams);

  if (res.code === 200) {
    // record new mock id
    const newMockId = res.data?.contentId;
    if (newMockId) {
      yield put(ACTIONS.updateMockId(newMockId));
    }

    const newVersionId = res.data?.id;
    if (typeof cb === 'function') cb(newVersionId);
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    message.error(res.msg || addFailed);
  }

  yield put(ACTIONS.updateMockLoading(false));
}

function* handlePublishMock(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateMockLoading(true));

  const { params, cb } = action.payload as { params: MockPublishParams; cb: () => void };
  const res = yield call(API.publishMock, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    if (typeof cb === 'function') {
      cb();
    }
    message.success(publishSuccess);
  } else {
    message.error(res.msg || publishFailed);
  }

  yield put(ACTIONS.updateMockLoading(false));
}

function* handleFetchPageTemplate(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateStoreLoading(true));

  const { params } = action.payload as { params: PageTemplateFetchParams };
  const res = yield call(API.fetchPageBuilderItems, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushPageTemplate(res.data, res.pageInfo));
  } else {
    const {
      builder: { fetchTemplateFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchTemplateFailed);
  }
  yield put(ACTIONS.updateStoreLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchCatalog), handleFetchCatalog);
  yield takeLatest(getType(ACTIONS.selectContent), handleSelectContent);
  yield takeLatest(getType(ACTIONS.fetchDsl), handleFetchDsl);
  yield takeLatest(getType(ACTIONS.saveMock), handleSaveMock);
  yield takeLatest(getType(ACTIONS.publishMock), handlePublishMock);
  yield takeLatest(getType(ACTIONS.fetchPageTemplate), handleFetchPageTemplate);
}

export default function* rootSaga() {
  yield all([watch()]);
}
