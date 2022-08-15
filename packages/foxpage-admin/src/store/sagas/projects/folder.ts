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
import { PaginationReqParams, ProjectListFetchParams, ProjectSaveParams } from '@/types/index';

function* handleFetchList(action: ProjectFolderActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { organizationId, page = 1, search, size = 10 } = action.payload as ProjectListFetchParams;
  let params: ProjectListFetchParams = {
    organizationId,
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

    message.error(res.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSave(action: ProjectFolderActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params, cb } = action.payload as { params: ProjectSaveParams; cb?: () => void };
  const { organizationId, applicationId } = params;
  const { editProject, pageInfo } = store.getState().projects.folder;
  const res = yield call(API.addProject, {
    name: editProject.name,
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
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDelete(action: ProjectFolderActionType) {
  const { id, applicationId, organizationId } = action.payload as {
    id: string;
    applicationId: string;
    organizationId: string;
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

    // refresh project list
    const { pageInfo, projectList } = store.getState().projects.folder;
    const page = projectList.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page;
    yield put(ACTIONS.fetchProjectList({ organizationId, ...pageInfo, page, search: '' }));
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handleFetchApp(action: ProjectFolderActionType) {
  const { params } = action.payload as { params: PaginationReqParams };
  const { organizationId } = store.getState().system.user;
  const res = yield call(APPLICATION_API.fetchList, {
    ...params,
    organizationId,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushApps(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
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
