import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/main';
import { RecordActionType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import * as RECORD_ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import { BuilderContentActionType } from '@/store/reducers/builder/main';
import { PageContent } from '@/types/index';

import { cache, clearCache, clearCacheLogs, getCached, getCurStep, initState, setCurStep } from './services';

function* handlePreStep() {
  function* future() {
    const {
      record: { operationFailed },
    } = getBusinessI18n();
    try {
      const { curStep, pageContent } = store.getState().builder.main;
      const { nodeUpdateRecords, nodeUpdateIndex } = store.getState().record.main;
      const steps = yield call(() => getCached(pageContent.contentId));
      if (curStep > 0) {
        const preStep = curStep - 1;
        const step = steps[preStep];
        yield put(ACTIONS.updateLastModified());
        if (step) {
          yield put(ACTIONS.goStep(step));
          const lastUpdateContent = nodeUpdateRecords[nodeUpdateIndex].content[0].content as string;
          const details = lastUpdateContent ? [JSON.parse(lastUpdateContent)] : [];
          yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.PAGE_PRE_STEP, details));
          yield call(() => setCurStep(pageContent.contentId, preStep, step));
        }
        yield put(ACTIONS.setCurStep(preStep));
      }
    } catch (err) {
      console.error('handlePreStep', err);
      message.error(operationFailed);
    }
  }
  yield put(ACTIONS.guard(future));
}

function* handleNextStep() {
  function* future() {
    const {
      record: { operationFailed },
    } = getBusinessI18n();
    try {
      const { curStep = 0, pageContent } = store.getState().builder.main;
      const { nodeUpdateRecords, nodeUpdateIndex } = store.getState().record.main;
      const steps = yield call(() => getCached(pageContent.contentId));
      if (curStep < steps.length) {
        const nextStep = curStep + 1;
        const step = steps[nextStep];
        yield put(ACTIONS.updateLastModified());
        if (step) {
          yield put(ACTIONS.goStep(step));
          const lastUpdateContent = nodeUpdateRecords[nodeUpdateIndex + 1].content[0].content as string;
          const details = lastUpdateContent ? [JSON.parse(lastUpdateContent)] : [];
          yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.PAGE_NEXT_STEP, details));
          yield call(() => setCurStep(pageContent.contentId, nextStep, step));
        }
        yield put(ACTIONS.setCurStep(nextStep));
      }
    } catch (err) {
      console.error('handleNextStep', err);
      message.error(operationFailed);
    }
  }
  yield put(ACTIONS.guard(future));
}

function* handleGoStep(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: PageContent };
  const { pageContent, application } = store.getState().builder.main;
  if (application) {
    yield put(ACTIONS.pushContent({ ...params, id: pageContent.id }));
    yield put(ACTIONS.updateEditState(true));
    const initParams = {
      application,
      locale: store.getState().builder.header.locale, // for parse
      components: store.getState().builder.component.components,
      extendPage: store.getState().builder.main.extend,
      file: store.getState().builder.main.file,
      relations: store.getState().builder.main.relations,
      parseInLocal: true,
    };
    const state = yield call(initState, params, initParams);
    yield put(ACTIONS.pushFormatData(state));
    yield put(ACTIONS.prasePageInServer(params, initParams));
  }
}

function* handleClearStep(actions: BuilderContentActionType) {
  const { contentId } = actions.payload as { contentId: string };
  // if (!ignoreStepCache) {
  yield call(() => clearCache(contentId));
  // }
  clearCacheLogs(contentId);
}

function* handleGetSteps() {
  const { pageContent } = store.getState().builder.main;
  const steps = yield call(() => getCached(pageContent?.contentId));
  const curStep = yield call(() => getCurStep(pageContent?.contentId));
  const lastStep = steps[curStep];
  if (lastStep) {
    yield put(ACTIONS.goStep(lastStep));
  }
  yield put(ACTIONS.setSteps(steps.length));
  yield put(ACTIONS.setCurStep(curStep));
}

function* handlePushStep(actions: BuilderContentActionType) {
  const { params, oldContent, curStep } = actions.payload as {
    params: PageContent;
    oldContent?: PageContent;
    curStep: number;
  };
  const cached = yield call(() => getCached(params?.contentId));
  let count = cached.length;
  // first cache
  if (count === 0) {
    if (oldContent?.contentId) {
      // cache origin first
      yield call(() => cache(oldContent, 0));
      count = count + 1;
    }
  }
  const _curStep = curStep || count;
  // cache
  yield call(() => cache(params, _curStep));
  yield put(ACTIONS.setCurStep(_curStep));
  yield put(ACTIONS.setSteps(count + 1));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.preStep), handlePreStep);
  yield takeLatest(getType(ACTIONS.nextStep), handleNextStep);
  yield takeLatest(getType(ACTIONS.goStep), handleGoStep);
  yield takeLatest(getType(ACTIONS.getSteps), handleGetSteps);
  yield takeLatest(getType(ACTIONS.pushStep), handlePushStep);
  yield takeLatest(getType(ACTIONS.clearByContentChange), handleClearStep);
}

export default function* rootSaga() {
  yield all([watch()]);
}
