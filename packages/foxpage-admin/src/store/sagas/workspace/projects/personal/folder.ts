import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/personal/folder';
import * as APPLICATION_API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import * as API from '@/apis/project';
import { rootFolderType } from '@/constants/file';
import { getBusinessI18n } from '@/foxI18n/index';
import { ProjectListActionType } from '@/reducers/workspace/projects/personal/folder';
import { store } from '@/store/index';
import {
  ApplicationListFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ProjectListFetchParams,
  ProjectSaveParams,
} from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';
import { errorToast } from '@/utils/error-toast';

function* handleFetchApp(action: ProjectListActionType) {
  const { params } = action.payload as { params: ApplicationListFetchParams };
  const res = yield call(APPLICATION_API.fetchList, {
    ...params,
    type: 'user_project',
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushApps(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleFetchAllApp(action: ProjectListActionType) {
  const { params } = action.payload as { params: ApplicationListFetchParams };
  const res = yield call(APPLICATION_API.fetchAllApplicationList, {
    ...params,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushAllApps(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleFetchList(action: ProjectListActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { page = 1, size = 10, search } = action.payload as ProjectListFetchParams;
  let params: ProjectListFetchParams = {
    page,
    size,
    searchType: 'project',
    type: 'user',
  };
  if (search) {
    params = {
      ...params,
      applicationId: search,
    };
  }
  const res = yield call(API.fetchProjects, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushProjectList(res.data || [], res.pageInfo));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSave(action: ProjectListActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params, cb } = action.payload as { params: ProjectSaveParams; cb?: () => void };
  const { editProject: project, applicationId } = params || {};
  const { editProject: storeProject } = store.getState().workspace.projects.personal.folder;
  const { organizationId } = store.getState().system.user;
  const editProject = !objectEmptyCheck(project) ? project : storeProject;

  const api: any = editProject?.id ? API.updateProject : API.addProject;
  const res = yield call(api, {
    projectId: editProject?.id,
    name: editProject?.name,
    applicationId: editProject?.application?.id || applicationId,
    type: rootFolderType.project,
    organizationId,
  });

  if (res.code === 200) {
    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, res?.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDelete(action: ProjectListActionType) {
  const { id, applicationId, cb } = action.payload as {
    id: string;
    applicationId: string;
    cb?: () => void;
  };
  const res = yield call(API.deleteProject, {
    projectId: id,
    applicationId,
    status: true,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchAuthList(action: ProjectListActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const res = yield call(AUTH_API.authorizeFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushAuthList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleFetchAuthUserList(action: ProjectListActionType) {
  const { params, cb } = action.payload as { params: AuthorizeUserFetchParams; cb?: (userList) => void };
  const res = yield call(AUTH_API.authorizeUserFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushUserList(res.data || []));

    if (typeof cb === 'function') cb(res.data);
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleSaveAuth(action: ProjectListActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeAdd, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    errorToast(res, addFailed);
  }
}

function* handleDeleteAuth(action: ProjectListActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApps), handleFetchApp);
  yield takeLatest(getType(ACTIONS.fetchAllApps), handleFetchAllApp);
  yield takeLatest(getType(ACTIONS.fetchProjectList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveProject), handleSave);
  yield takeLatest(getType(ACTIONS.deleteProject), handleDelete);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchAuthUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
