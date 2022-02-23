import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { fetchAllApplicationList } from '@/apis/group/application/list';
import * as API from '@/apis/store/list';
import { FileTypeEnum } from '@/constants/index';
import { getBusinessI18n } from '@/pages/locale';
import { StoreResourceListActionType } from '@/reducers/store/list';
import { store } from '@/store/index';
import { GoodsAddParams, PaginationReqParams, StoreResourceSearchParams } from '@/types/index';

function* handleFetchStoreResources(action: StoreResourceListActionType) {
  const { appIds, type, search, page, size } = action.payload as StoreResourceSearchParams;
  yield put(ACTIONS.updateLoading(true));
  const {
    store: { fetchResourceFailed },
  } = getBusinessI18n();
  const isPackage = type === FileTypeEnum.package;
  const fetchApi = isPackage ? API.fetchStorePackageResources : API.fetchStoreProjectResources;

  const res = yield call(fetchApi, { appIds, type, search, page, size });
  if (res.code === 200) {
    yield put(ACTIONS.updateLoading(false));
    yield put(
      isPackage
        ? ACTIONS.pushPackageStoreResources(res.data, res.pageInfo)
        : ACTIONS.pushProjectStoreResources(res.data, res.pageInfo),
    );
  } else {
    message.error(res.msg || fetchResourceFailed);
  }
}

function* handleAddGoods(action: StoreResourceListActionType) {
  const { type } = store.getState().store.list;
  const { appIds, goodsIds, delivery } = action.payload as GoodsAddParams;
  const {
    store: { buySuccess, buyFailed },
  } = getBusinessI18n();
  const res = yield call(type === FileTypeEnum.package ? API.addPackageGoods : API.addPageGoods, {
    appIds,
    goodsIds,
    delivery,
  });

  if (res.code === 200) {
    message.success(buySuccess);
    yield put(ACTIONS.updateBuyModalVisible(false));
  } else {
    message.error(res.msg || buyFailed);
  }
}

function* handleFetchAllApplication(action: StoreResourceListActionType) {
  const { page, search, size } = action.payload as PaginationReqParams;
  const {
    application: { fetchListFailed },
  } = getBusinessI18n();
  const res = yield call(fetchAllApplicationList, { page, search: search || '', size });

  if (res.code === 200) {
    yield put(ACTIONS.pushAllApplicationList(res.data));
  } else {
    message.error(res.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchStoreResources), handleFetchStoreResources);
  yield takeLatest(getType(ACTIONS.addGoods), handleAddGoods);
  yield takeLatest(getType(ACTIONS.fetchAllApplicationList), handleFetchAllApplication);
}

export default function* rootSaga() {
  yield all([watch()]);
}
