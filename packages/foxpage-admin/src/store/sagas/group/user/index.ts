import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/user';
import * as API from '@/apis/group/user';
import { UserActionType } from '@/reducers/group/user';
import { AddOrganizationUserParams, DeleteOrganizationUserParams, OrganizationUserSearchParams } from '@/types/index';

const PAGE_SIZE = 10000;

function* handleFetchOrganizationUsers(actions: UserActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { organizationId, page } = actions.payload as OrganizationUserSearchParams;
  const rs = yield call(API.fetchOrganizationUsers, { organizationId, page, size: PAGE_SIZE });
  if (rs.code === 200) {
    yield put(ACTIONS.pushOrganizationUsers(rs.data));
  } else {
    message.error(rs.msg || 'Fetch user list failed.');
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleAddUser(actions: UserActionType) {
  const user = actions.payload as AddOrganizationUserParams;
  const rs = yield call(API.addOrganizationUser, user);
  if (rs.code === 200) {
    yield put(ACTIONS.updateAccountDrawerOpen(false));
    yield put(ACTIONS.updateAddedUserInfo(rs.data));
    yield put(ACTIONS.fetchOrganizationUsers({ organizationId: user.organizationId, page: 1, size: PAGE_SIZE }));
  } else {
    message.error(rs.msg || 'Add user failed.');
  }
}

function* handleDeleteUser(actions: UserActionType) {
  const params = actions.payload as DeleteOrganizationUserParams;
  const rs = yield call(API.deleteOrganizationUser, params);
  if (rs.code === 200) {
    message.success('Delete succeed');
    yield put(ACTIONS.updateAccountDrawerOpen(false));
    yield put(ACTIONS.fetchOrganizationUsers({ organizationId: params.organizationId, page: 1, size: PAGE_SIZE }));
  } else {
    message.error(rs.msg || 'Delete user failed.');
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.addOrganizationUser), handleAddUser);
  yield takeLatest(getType(ACTIONS.deleteOrganizationUser), handleDeleteUser);
  yield takeLatest(getType(ACTIONS.fetchOrganizationUsers), handleFetchOrganizationUsers);
}

export default function* rootSaga() {
  yield all([watch()]);
}
