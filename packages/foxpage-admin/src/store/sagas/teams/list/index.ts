import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import * as API from '@/apis/group/team';
import { getBusinessI18n } from '@/pages/locale';
import { TeamsActionType } from '@/reducers/teams/list';
import { store } from '@/store/index';
import { Team, TeamFetchParams, TeamUsersAddParams, TeamUsersFetchParams } from '@/types/team';

function* handleFetchTeamList(actions: TeamsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const {
    global: { fetchListFailed },
  } = getBusinessI18n();
  const params = actions.payload as TeamFetchParams;
  const rs = yield call(API.fetchTeamList, params);
  if (rs.code === 200) {
    yield put(ACTIONS.pushTeamList(rs.data, rs.pageInfo));
  } else {
    message.error(rs.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleAddTeam(actions: TeamsActionType) {
  const { pageInfo } = store.getState().teams.list;
  const {
    global: { saveFailed },
  } = getBusinessI18n();
  const { organizationId, team } = actions.payload as { organizationId: string; team: Team };
  const rs = yield call(API.addTeam, { name: team.name, organizationId });
  if (rs.code === 200) {
    yield put(ACTIONS.closeDrawer());
    yield put(ACTIONS.fetchTeamList({ organizationId, page: pageInfo.page, size: pageInfo.size }));
  } else {
    message.error(rs.msg || saveFailed);
  }
}

function* handleUpdateTeam(actions: TeamsActionType) {
  const { pageInfo } = store.getState().teams.list;
  const {
    global: { updateFailed },
  } = getBusinessI18n();
  const { organizationId, team } = actions.payload as { organizationId: string; team: Team };
  const rs = yield call(API.updateTeam, { teamId: team.id, name: team.name });
  if (rs.code === 200) {
    yield put(ACTIONS.closeDrawer());
    yield put(ACTIONS.fetchTeamList({ organizationId, page: pageInfo.page, size: pageInfo.size }));
  } else {
    message.error(rs.msg || updateFailed);
  }
}

function* handleDeleteTeam(actions: TeamsActionType) {
  const { pageInfo, list } = store.getState().teams.list;
  const {
    global: { deleteFailed },
  } = getBusinessI18n();
  const { organizationId, team } = actions.payload as { organizationId: string; team: Team };
  const rs = yield call(API.deleteTeam, { teamId: team.id, status: true });
  if (rs.code === 200) {
    yield put(ACTIONS.closeDrawer());
    const page = list.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page;
    yield put(ACTIONS.fetchTeamList({ organizationId, page, size: pageInfo.size }));
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleAddTeamUsers(actions: TeamsActionType) {
  const { users, teamId, onSuccess } = actions.payload as TeamUsersAddParams;
  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();
  const rs = yield call(API.AddTeamUsers, { teamId, userIds: users.map((user) => user.userId) });
  if (rs.code === 200) {
    message.success(saveSuccess);
    yield put(ACTIONS.updateTeamUsersAfterAdd(users));
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || saveFailed);
  }
}

function* handleDeleteTeamUsers(actions: TeamsActionType) {
  const { users, teamId } = actions.payload as TeamUsersAddParams;
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const rs = yield call(API.deleteTeamUsers, { teamId, userIds: users.map((user) => user.userId) });
  if (rs.code === 200) {
    message.success(deleteSuccess);
    yield put(ACTIONS.updateTeamUsersAfterDelete(users));
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleFetchTeamUsers(actions: TeamsActionType) {
  yield put(ACTIONS.updateTeamManagementLoading(true));
  const {
    team: { fetchUsersFailed },
  } = getBusinessI18n();
  const { teamId, page, size } = actions.payload as TeamUsersFetchParams;
  const rs = yield call(API.fetchTeamUsers, { teamId, page, size });
  if (rs.code === 200) {
    yield put(ACTIONS.pushTeamUsers(rs.data));
  } else {
    message.error(rs.msg || fetchUsersFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTeamList), handleFetchTeamList);
  yield takeLatest(getType(ACTIONS.addTeam), handleAddTeam);
  yield takeLatest(getType(ACTIONS.updateTeam), handleUpdateTeam);
  yield takeLatest(getType(ACTIONS.deleteTeam), handleDeleteTeam);
  yield takeLatest(getType(ACTIONS.addTeamUsers), handleAddTeamUsers);
  yield takeLatest(getType(ACTIONS.deleteTeamUsers), handleDeleteTeamUsers);
  yield takeLatest(getType(ACTIONS.fetchTeamUsers), handleFetchTeamUsers);
}

export default function* rootSaga() {
  yield all([watch()]);
}
