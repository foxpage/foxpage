import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/main';
import { store } from '@/store/index';
import { BuilderContentActionType } from '@/store/reducers/builder/main';
import { PageContent } from '@/types/index';

import { cache, clearCache, getCached, initState } from './services';

function* handlePreStep() {
  const { curStep, content } = store.getState().builder.main;
  const steps = getCached(content.id);
  if (curStep > 0) {
    const preStep = curStep - 1;
    const step = steps[preStep];
    if (step) {
      yield put(ACTIONS.goStep(step));
    }
    yield put(ACTIONS.setCurStep(preStep));
  }
}

function* handleNextStep() {
  const { curStep = 0, content } = store.getState().builder.main;
  const steps = getCached(content.id);
  if (curStep < steps.length) {
    const nextStep = curStep + 1;
    const step = steps[nextStep];
    if (step) {
      yield put(ACTIONS.goStep(step));
    }
    yield put(ACTIONS.setCurStep(nextStep));
  }
}

function* handleDoStep(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: PageContent };
  // @ts-ignore
  const state = yield call(initState, params, {
    application: store.getState().builder.main.application,
    locale: store.getState().builder.header.locale, // for parse
    components: store.getState().builder.component.components,
    extendPage: store.getState().builder.main.extend,
    file: store.getState().builder.main.file,
  });
  yield put(ACTIONS.pushContent(params));
  yield put(ACTIONS.pushFormatData(state));
  yield put(ACTIONS.updateEditState(true));
}

function* handleClearStep() {
  clearCache();
}

function* handleGetSteps() {
  const { content } = store.getState().builder.main;
  const steps = getCached(content.id);
  yield put(ACTIONS.setSteps(steps.length));
  yield put(ACTIONS.setCurStep(steps.length));
}

function* handlePushStep(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: PageContent };
  const cached = getCached(params.contentId);
  if (cached.length === 0) {
    const { pageContent } = store.getState().builder.main;
    if (pageContent.contentId) {
      // cache origin first
      cache(pageContent);
    }
  }
  // cache
  const count = cache(params);
  yield put(ACTIONS.setCurStep(count > 0 ? count - 1 : 0));
  yield put(ACTIONS.setSteps(count));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.preStep), handlePreStep);
  yield takeLatest(getType(ACTIONS.nextStep), handleNextStep);
  yield takeLatest(getType(ACTIONS.goStep), handleDoStep);
  yield takeLatest(getType(ACTIONS.getSteps), handleGetSteps);
  yield takeLatest(getType(ACTIONS.pushStep), handlePushStep);
  yield takeLatest(getType(ACTIONS.clearAll), handleClearStep);
  yield takeLatest(getType(ACTIONS.clearByContentChange), handleClearStep);
}

export default function* rootSaga() {
  yield all([watch()]);
}
