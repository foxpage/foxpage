import { cloneDeep, merge } from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/components';
import { fetchLiveBlockDsl } from '@/apis/builder/block';
import * as API from '@/apis/builder/component';
import { FileType } from '@/constants/global';
import { getBusinessI18n } from '@/foxI18n/index';
import { ComponentsActionType } from '@/store/reducers/builder/component';
import {
  ComponentFetchRes,
  ComponentVersionDetailsFetchedRes,
  ComponentVersionDetailsFetchParams,
  ComponentVersionFetchParams,
  FetchLiveBlockDslRes,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchComponents(action: ComponentsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, locale } = action.payload as { applicationId: string; locale: string };
  const res: ComponentFetchRes = yield call(API.fetchLiveComponentList, {
    applicationId,
    type: ['component', 'systemComponent'],
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushComponentList(res.data || []));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  const components = res.data || [];
  const showBlockIds = components
    .filter((item) => item.status && !!item.category?.categoryName && item.type === FileType.block)
    .map((item) => item.id);

  if (showBlockIds.length > 0) {
    const blockRes: FetchLiveBlockDslRes = yield call(fetchLiveBlockDsl, {
      applicationId,
      ids: showBlockIds,
      locale,
    });
    if (blockRes.code === 200 && blockRes.data) {
      const dslMap = blockRes.data;
      yield put(ACTIONS.pushBlockDSL(dslMap));
      const emptyBlocks = Object.keys(dslMap).filter((id) => JSON.stringify(dslMap[id]) === '{}');
      const clonedComponents = cloneDeep(components);
      emptyBlocks.forEach((id) => {
        const component = clonedComponents.find((item) => item.id === id);
        if (component) {
          merge(component, { __extentions: { disabled: true } });
        }
      });
      yield put(ACTIONS.pushComponentList(clonedComponents)); // update disabled components
    }
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleFetchComponentVersions(action: ComponentsActionType) {
  const { params } = action.payload as { params: ComponentVersionFetchParams };
  const res: ComponentFetchRes = yield call(API.getComponentVersions, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushComponentVersions(res.data || []));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleFetchComponentVersionDetails(action: ComponentsActionType) {
  const { params } = action.payload as { params: ComponentVersionDetailsFetchParams };
  const res: ComponentVersionDetailsFetchedRes = yield call(API.getComponentVersionDetails, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushComponentVersionDetails(res.data || []));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentList), handleFetchComponents);
  yield takeLatest(getType(ACTIONS.fetchComponentVersions), handleFetchComponentVersions);
  yield takeLatest(getType(ACTIONS.fetchComponentVersionDetails), handleFetchComponentVersionDetails);
}

export default function* rootSaga() {
  yield all([watch()]);
}
