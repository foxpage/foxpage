import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import * as APPLICATION_API from '@/apis/application';
import * as API from '@/apis/store';
import { getBusinessI18n } from '@/foxI18n/index';
import { StoreResourceListActionType } from '@/reducers/store/list';
import { store } from '@/store/index';
import {
  ApplicationListFetchParams,
  GoodsAddParams,
  PaginationReqParams,
  StoreResourceSearchParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchResources(action: StoreResourceListActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { appIds, type, search, page, size } = action.payload as StoreResourceSearchParams;
  const map = {
    package: {
      api: API.fetchPackageResources,
      action: 'pushPackageResources',
    },
    variable: {
      api: API.fetchVariableResources,
      action: 'pushVariableResources',
    },
    page: {
      api: API.fetchProjectResources,
      action: 'pushProjectResources',
    },
    template: {
      api: API.fetchProjectResources,
      action: 'pushProjectResources',
    },
  };
  const fetchApi = type && map[type].api;
  const res = yield call(fetchApi, { appIds, type, search, page, size });

  if (res.code === 200) {
    const actionName = type && map[type].action;
    yield put(ACTIONS[actionName](res.data, res.pageInfo));
  } else {
    const {
      store: { fetchResourceFailed },
    } = getBusinessI18n();

    errorToast(res, fetchResourceFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleFetchApplicationList(actions: StoreResourceListActionType) {
  const { params } = actions.payload as { params: ApplicationListFetchParams };
  const res = yield call(APPLICATION_API.fetchList, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushApplicationList(res.data));
  } else {
    const {
      application: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleFetchAllApplicationList(action: StoreResourceListActionType) {
  const { page, search, size } = action.payload as PaginationReqParams;
  const res = yield call(APPLICATION_API.fetchAllApplicationList, { page, search: search || '', size });

  if (res.code === 200) {
    yield put(ACTIONS.pushAllApplicationList(res.data));
  } else {
    const {
      application: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleAddGoods(action: StoreResourceListActionType) {
  const { appIds, goodsIds, delivery } = action.payload as GoodsAddParams;
  const goodsTypeApiMap = {
    package: API.addPackageGoods,
    page: API.addPageGoods,
    template: API.addPageGoods,
    variable: API.addVariableGoods,
  };
  const { type } = store.getState().store.list;
  const res = yield call(goodsTypeApiMap[type], {
    appIds,
    goodsIds,
    delivery,
    type: type === 'variable' ? type : undefined,
  });

  const {
    store: { buySuccess, buyFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(buySuccess);

    yield put(ACTIONS.updateBuyModalVisible(false));
  } else {
    errorToast(res, buyFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchResources), handleFetchResources);
  yield takeLatest(getType(ACTIONS.fetchApplicationList), handleFetchApplicationList);
  yield takeLatest(getType(ACTIONS.fetchAllApplicationList), handleFetchAllApplicationList);
  yield takeLatest(getType(ACTIONS.addGoods), handleAddGoods);
}

export default function* rootSaga() {
  yield all([watch()]);
}
