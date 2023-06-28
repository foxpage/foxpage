import _ from 'lodash';
import { all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/main';
import { store } from '@/store/index';

import { validateContent } from './services';

function* handleValidate() {
  const { pageContent, localVariables = [] } = store.getState().builder.main;
  const relations = {
    ...pageContent.relations,
    variables: (pageContent?.relations?.variables || []).concat(localVariables),
  };
  // validate
  const result = validateContent(pageContent, { relations });
  return result;
}

function* watch() {
  yield takeLatest(getType(ACTIONS.validate), handleValidate);
}

export default function* rootSaga() {
  yield all([watch()]);
}
