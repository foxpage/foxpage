import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/list';
import * as AUTH_API from '@/apis/auth';
import { fetchList } from '@/apis/group/application/list';
import * as API from '@/apis/group/project';
import { rootFolderType } from '@/pages/common/constant/FileType';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectListActionType } from '@/reducers/workspace/projects/project/list';
import { store } from '@/store/index';
import {
  ApplicationFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ProjectListFetchParams,
  ProjectSaveParams,
} from '@/types/index';

function* handleFetchApp(action: ProjectListActionType) {
  // TODO: search to fetch
  const { params } = action.payload as { params: ApplicationFetchParams };
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();
  const rs = yield call(fetchList, params);
  if (rs.code === 200) {
    yield put(ACTIONS.pushApps(rs.data || []));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* handleFetchList(action: ProjectListActionType) {
  yield put(ACTIONS.setLoading(true));

  const {
    organizationId,
    page = 1,
    search = '',
    size = 10,
    type = 'user',
  } = action.payload as ProjectListFetchParams;
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  const rs = yield call(API.fetchProjects, {
    page,
    search,
    size,
    organizationId,
    type,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.pushProjectList(rs.data || [], rs.pageInfo));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* save(action: ProjectListActionType) {
  const { organizationId, onSuccess } = action.payload as ProjectSaveParams;
  const { editProject, pageInfo } = store.getState().workspace.projects.project.list;
  const {
    global: { fetchListFailed },
    application: { nameInvalid, notSelectError },
  } = getBusinessI18n();
  if (!editProject.name) {
    message.warning(nameInvalid);
    return;
  }
  // if (editProject.name.length < 5) {
  //   message.warning(nameLengthInvalid);
  //   return;
  // }
  if (!editProject.application || !editProject.application.id) {
    message.warning(notSelectError);
    return;
  }
  yield put(ACTIONS.setSaveLoading(true));
  const api: any = editProject.id ? API.updateProject : API.addProject;
  const rs = yield call(api, {
    projectId: editProject.id,
    name: editProject.name,
    applicationId: editProject.application.id,
    type: rootFolderType.project,
    organizationId,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.setAddDrawerOpenStatus(false));
    if (typeof onSuccess === 'function') {
      onSuccess();
    } else {
      yield put(
        ACTIONS.fetchProjectList({
          organizationId,
          ...pageInfo,
          search: '',
          type: 'user',
        }),
      );
    }
  } else {
    message.error(rs.msg || fetchListFailed);
  }
  yield put(ACTIONS.setSaveLoading(false));
}

function* deleteProject(action: ProjectListActionType) {
  const { id, applicationId, organizationId } = action.payload as {
    id: string;
    applicationId: string;
    organizationId: string;
  };
  const { pageInfo, projectList } = store.getState().workspace.projects.project.list;
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const rs = yield call(API.deleteProject, {
    projectId: id,
    applicationId,
    status: true,
  });
  if (rs.code === 200) {
    message.success(deleteSuccess);
    const page = projectList.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page;
    yield put(ACTIONS.fetchProjectList({ organizationId, ...pageInfo, page, search: '', type: 'user' }));
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleAuthFetchList(action: ProjectListActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const rs = yield call(AUTH_API.authorizeFetch, params);

  if (rs.code === 200) {
    yield put(ACTIONS.pushAuthList(rs.data || []));
  } else {
    message.error(rs.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleAuthAdd(action: ProjectListActionType) {
  const {
    global: { addFailed },
  } = getBusinessI18n();

  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const rs = yield call(AUTH_API.authorizeAdd, params);

  if (rs.code === 200) {
    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || addFailed);
  }
}

function* handleAuthDelete(action: ProjectListActionType) {
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const rs = yield call(AUTH_API.authorizeDelete, params);

  if (rs.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleAuthUserFetchList(action: ProjectListActionType) {
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  const { params } = action.payload as { params: AuthorizeUserFetchParams };
  const rs = yield call(AUTH_API.authorizeUserFetch, params);

  if (rs.code === 200) {
    yield put(ACTIONS.pushUserList(rs.data || []));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApps), handleFetchApp);
  yield takeLatest(getType(ACTIONS.fetchProjectList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveProject), save);
  yield takeLatest(getType(ACTIONS.deleteProject), deleteProject);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleAuthFetchList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleAuthUserFetchList);
  yield takeLatest(getType(ACTIONS.authAddUser), handleAuthAdd);
  yield takeLatest(getType(ACTIONS.authDeleteUser), handleAuthDelete);
}

export default function* rootSaga() {
  yield all([watch()]);
}
