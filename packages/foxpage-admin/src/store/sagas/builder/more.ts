import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/more';
import * as TEMPLATE_ACTIONS from '@/actions/builder/template';
import * as MOCK_API from '@/apis//builder/mock';
import * as API from '@/apis/builder/index';
import { FileTypeEnum } from '@/constants/index';
import { getBusinessI18n } from '@/pages/locale';
import * as utils from '@/services/builder';
import { store } from '@/store/index';
import { MoreActionType } from '@/store/reducers/builder/more';
import { MockNewParams, MockPublishParams,MockValueUpdateParams } from '@/types/builder';
import { DslFetchParams } from '@/types/builder/more';

function* handleFetchDsl(action: MoreActionType) {
  const {
    builder: { fetchDslFailed },
  } = getBusinessI18n();
  const { fileType } = store.getState().builder.page;
  const { applicationId, ids } = action.payload as DslFetchParams;
  yield put(ACTIONS.updateLoading(true));

  const res = yield call(fileType === FileTypeEnum.page ? API.fetchPageDsl : API.fetchTemplateDsl, {
    applicationId,
    ids,
  });
  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushDsl(res.data[0]?.content));
  } else {
    message.error(res.msg || fetchDslFailed);
  }
  yield put(ACTIONS.updateLoading(false));
}

function* handleUpdateMock(action: MoreActionType) {
  yield put(TEMPLATE_ACTIONS.updatePageEditStatus(true));

  const { params } = action.payload as { params: MockValueUpdateParams };
  const { applicationId, folderId, value } = params || {};

  // get whole page relation & mock data
  const { version, selectedComponent } = store.getState().builder.template;
  const { mock } = store.getState().builder.more;

  // check for is new relation
  const { relation } = yield utils.searchVariableRelation({
    applicationId,
    folderId,
    props: value,
    oldRelation: version.content.relation,
  });

  const newMock = _.cloneDeep(mock);

  // add new relation if there is new relation
  if (relation) {
    newMock.relation = Object.assign({}, newMock.relation, relation);
  }

  // check if the item has been updated before
  const schemas = newMock?.schemas;
  const origin = schemas && schemas.find((item) => item.id === selectedComponent?.id);
  if (!origin) {
    schemas.push({
      id: selectedComponent?.id,
      name: selectedComponent?.name,
      props: value,
    });
  } else {
    origin.props = value;
  }

  yield put(ACTIONS.pushMock(newMock));
}

function* handleAddMock(action: MoreActionType) {
  yield put(ACTIONS.updateMockLoading(true));

  // error msg multi-language
  const {
    global: { addFailed },
  } = getBusinessI18n();

  // call mock add api
  const { params, cb } = action.payload as { params: MockNewParams; cb: (mockId?: string) => void };
  const { applicationId, content } = params;
  // get specific api & params with different update type
  const { mockId } = store.getState().builder.more;
  const api: any = !!mockId ? MOCK_API.mockUpdate : MOCK_API.mockAdd;
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

    if (typeof cb === 'function') {
      cb(newMockId);
    }
  } else {
    message.error(res.msg || addFailed);
  }

  yield put(ACTIONS.updateMockLoading(false));
}

function* handlePublishMock(action: MoreActionType) {
  yield put(ACTIONS.updateMockLoading(true));

  // error msg multi-language
  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  // call mock add api
  const { params, cb } = action.payload as { params: MockPublishParams; cb: () => void };
  const res = yield call(MOCK_API.mockPublish, params);
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

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchDsl), handleFetchDsl);
  yield takeLatest(getType(ACTIONS.updateMock), handleUpdateMock);
  yield takeLatest(getType(ACTIONS.addMock), handleAddMock);
  yield takeLatest(getType(ACTIONS.publishMock), handlePublishMock);
}

export default function* rootSaga() {
  yield all([watch()]);
}
