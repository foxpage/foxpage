import { message } from 'antd';
import Axios from 'axios';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { fetchContent } from '@/actions/builder/main';
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
import { errorToast } from '@/utils/error-toast';

import { wrapperMock } from './utils';

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

    errorToast(res, fetchCatalogFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSelectContent(action: BuilderHeaderActionType) {
  const { applicationId, folderId, fileId, contentId, locale, fileType } =
    action.payload as CatalogContentSelectParams;

  yield all([
    put(ACTIONS.updateLocale(locale || '')),
    put(ACTIONS.updateContentInfo({ applicationId, contentId, fileId, folderId, fileType })),
  ]);
}

// dls, html, mock related
function* handleFetchDsl(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateDSLLoading(true));

  const { fileType } = store.getState().builder.header;
  const { applicationId, ids } = action.payload;

  const apis = {
    [FileType.page]: API.fetchPageDsl,
    [FileType.template]: API.fetchTemplateDsl,
    [FileType.block]: API.fetchBlockDsl,
  };

  const res = yield call(apis[fileType], {
    applicationId,
    ids,
  });

  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushDsl(res.data[0]?.content));
  } else {
    const {
      builder: { fetchDslFailed },
    } = getBusinessI18n();

    errorToast(res, fetchDslFailed);
  }
  yield put(ACTIONS.updateDSLLoading(false));
}

function* handleFetchHtml(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateHTMLLoading(true));

  const { url } = action.payload;
  const fetchHtml: any = () =>
    new Promise((resolve) => {
      Axios.get(url).then((rs) => {
        resolve(rs);
      });
    });
  const res = yield call(fetchHtml, {});

  if (res.status === 200) {
    yield put(ACTIONS.pushHtml(res.data));
  } else {
    const {
      builder: { fetchHtmlFailed },
    } = getBusinessI18n();

    errorToast(res, fetchHtmlFailed);
  }
  yield put(ACTIONS.updateHTMLLoading(false));
}

function* handleSaveMock(action: BuilderHeaderActionType) {
  yield put(ACTIONS.updateMockLoading(true));

  // call mock add api
  const { params, cb } = action.payload as { params: MockNewParams; cb: (mockId?: string) => void };
  params.content = wrapperMock(params.content);
  const { applicationId, content } = params;
  const { contentId } = store.getState().builder.header;

  // get specific api & params with different update type
  const mockId = params?.content?.id;
  const api: any = !!mockId ? API.updateMock : API.saveMock;
  const newParams = !mockId
    ? params
    : {
        applicationId,
        id: mockId,
        content,
        pageContentId: contentId,
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

    if (params?.refresh) {
      const { applicationId: appId } = store.getState().builder.header;
      const { file } = store.getState().builder.main;
      yield put(
        fetchContent({
          applicationId: applicationId || appId,
          id: contentId,
          type: file?.type || 'page',
        }),
      );
    }
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    errorToast(res, addFailed);
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
    errorToast(res, publishFailed);
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

    errorToast(res, fetchTemplateFailed);
  }
  yield put(ACTIONS.updateStoreLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchCatalog), handleFetchCatalog);
  yield takeLatest(getType(ACTIONS.selectContent), handleSelectContent);
  yield takeLatest(getType(ACTIONS.fetchDsl), handleFetchDsl);
  yield takeLatest(getType(ACTIONS.fetchHtml), handleFetchHtml);
  yield takeLatest(getType(ACTIONS.saveMock), handleSaveMock);
  yield takeLatest(getType(ACTIONS.publishMock), handlePublishMock);
  yield takeLatest(getType(ACTIONS.fetchPageTemplate), handleFetchPageTemplate);
}

export default function* rootSaga() {
  yield all([watch()]);
}
