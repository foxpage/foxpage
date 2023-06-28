import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import * as USER_API from '@/apis/system/user';
import * as API from '@/apis/team';
import { getBusinessI18n } from '@/foxI18n/index';
import { TeamsActionType } from '@/reducers/teams/list';
import { store } from '@/store/index';
import {
  TeamEntity,
  TeamMembersFetchParams,
  TeamMembersParams,
  TeamSaveParams,
  TeamsFetchParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchTeamList(actions: TeamsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = actions.payload as TeamsFetchParams;
  const res = yield call(API.fetchTeamList, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushTeamList(res.data, res.pageInfo));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveTeam(actions: TeamsActionType) {
  const { params, cb } = actions.payload as { params: TeamSaveParams; cb?: () => void };
  const { organizationId, team } = params || {};
  const api = team?.id ? API.updateTeam : API.addTeam;
  let req: any = { name: team.name };
  if (team?.id) {
    req = {
      ...req,
      teamId: team.id,
    };
  } else {
    req = {
      ...req,
      organizationId,
    };
  }
  const res = yield call(api, req);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, saveFailed);
  }
}

function* handleDeleteTeam(actions: TeamsActionType) {
  const { organizationId, team } = actions.payload as { organizationId: string; team: TeamEntity };
  const res = yield call(API.deleteTeam, { teamId: team.id, status: true });

  const {
    global: { deleteFailed, deleteSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    // close drawer and refresh team list
    yield put(ACTIONS.openDrawer(false));

    const { pageInfo, list } = store.getState().teams.list;
    const page = list.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page;
    yield put(ACTIONS.fetchTeamList({ organizationId, page, size: pageInfo.size }));
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleAddTeamUsers(actions: TeamsActionType) {
  const { params, cb } = actions.payload as { params: TeamMembersParams; cb?: () => void };
  const { teamId, users } = params;
  const res = yield call(API.AddTeamUsers, { teamId, userIds: users.map((user) => user.userId) });

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.updateTeamUsersAfterAdd(users));

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, saveFailed);
  }
}

function* handleDeleteTeamUsers(actions: TeamsActionType) {
  const { params } = actions.payload as { params: TeamMembersParams };
  const { teamId, users } = params;
  const res = yield call(API.deleteTeamUsers, { teamId, userIds: users.map((user) => user.userId) });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    yield put(ACTIONS.updateTeamUsersAfterDelete(users));
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchTeamUsers(actions: TeamsActionType) {
  yield put(ACTIONS.updateTeamManagementLoading(true));

  const { params } = actions.payload as { params: TeamMembersFetchParams };
  const res = yield call(API.fetchTeamUsers, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushTeamUsers(res.data));
  } else {
    const {
      team: { fetchUsersFailed },
    } = getBusinessI18n();

    errorToast(res, fetchUsersFailed);
  }
}

function* handleFetchOrganizationUsers(actions: TeamsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = actions.payload as { params: TeamsFetchParams };
  const res = yield call(USER_API.fetchOrganizationUsers, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushOrganizationUsers(res.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTeamList), handleFetchTeamList);
  yield takeLatest(getType(ACTIONS.saveTeam), handleSaveTeam);
  yield takeLatest(getType(ACTIONS.deleteTeam), handleDeleteTeam);
  yield takeLatest(getType(ACTIONS.addTeamUsers), handleAddTeamUsers);
  yield takeLatest(getType(ACTIONS.deleteTeamUsers), handleDeleteTeamUsers);
  yield takeLatest(getType(ACTIONS.fetchTeamUsers), handleFetchTeamUsers);
  yield takeLatest(getType(ACTIONS.fetchOrganizationUsers), handleFetchOrganizationUsers);
}

export default function* rootSaga() {
  yield all([watch()]);
}
