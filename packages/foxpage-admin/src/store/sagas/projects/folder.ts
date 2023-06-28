import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/folder';
import * as APPLICATION_API from '@/apis/application';
import * as API from '@/apis/project';
import { rootFolderType } from '@/constants/file';
import { getBusinessI18n } from '@/foxI18n/index';
import { ProjectFolderActionType } from '@/reducers/projects/folder';
import { store } from '@/store/index';
import { ApplicationListFetchParams, ProjectListFetchParams, ProjectSaveParams } from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';
import { errorToast } from '@/utils/error-toast';

function* handleFetchList(action: ProjectFolderActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { organizationId, search, page = 1, size = 10 } = action.payload as ProjectListFetchParams;
  let params: ProjectListFetchParams = {
    organizationId,
    searchType: 'project',
    page,
    size,
  };
  if (search)
    params = {
      ...params,
      applicationId: search,
    };
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

function* handleSave(action: ProjectFolderActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params, cb } = action.payload as { params: ProjectSaveParams; cb?: () => void };
  const { editProject: project, organizationId, applicationId } = params || {};
  const { editProject: storeProject, pageInfo } = store.getState().projects.folder;
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
    if (typeof cb === 'function') {
      cb();
    } else {
      yield put(
        ACTIONS.fetchProjectList({
          organizationId,
          ...pageInfo,
          search: applicationId,
        }),
      );
    }
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, res?.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDelete(action: ProjectFolderActionType) {
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

function* handleFetchApp(action: ProjectFolderActionType) {
  const { params } = action.payload as { params: ApplicationListFetchParams };
  const res = yield call(APPLICATION_API.fetchList, {
    ...params,
    type: 'project',
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

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchProjectList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveProject), handleSave);
  yield takeLatest(getType(ACTIONS.deleteProject), handleDelete);
  yield takeLatest(getType(ACTIONS.fetchApps), handleFetchApp);
}

export default function* rootSaga() {
  yield all([watch()]);
}
