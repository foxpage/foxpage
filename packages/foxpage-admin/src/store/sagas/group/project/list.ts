import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/list';
import { fetchList } from '@/apis/group/application/list';
import * as API from '@/apis/group/project';
import { rootFolderType } from '@/pages/common/constant/FileType';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectListActionType } from '@/reducers/group/project/list';
import { store } from '@/store/index';
import { PaginationReqParams } from '@/types/common';
import { ProjectSaveParams } from '@/types/project';
import { getLoginUser } from '@/utils/login-user';

function* handleFetchApp(action: ProjectListActionType) {
  const { page = 1, search = '', size = 10 } = action.payload as PaginationReqParams;
  const userInfo = getLoginUser();
  const organizationId = userInfo?.organizationId || '';
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();
  const rs = yield call(fetchList, {
    page,
    search,
    size,
    organizationId,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.pushApps(rs.data || []));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* handleFetchList(action: ProjectListActionType) {
  const { page = 1, search = '', size = 10 } = action.payload as PaginationReqParams;
  const userInfo = getLoginUser();
  const organizationId = userInfo?.organizationId;
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.setLoading(true));
  const rs = yield call(API.fetchProjects, {
    page,
    search,
    size,
    organizationId,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.pushProjectList(rs.data || [], rs.pageInfo));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* save(action: ProjectListActionType) {
  const { organizationId, onSuccess } = action.payload as ProjectSaveParams;
  const { editProject, pageInfo } = store.getState().group.project.list;
  const {
    global: { fetchListFailed },
    application: { nameInvalid, nameLengthInvalid, notSelectError },
  } = getBusinessI18n();
  if (!editProject.name) {
    message.warning(nameInvalid);
    return;
  }
  if (editProject.name.length < 5) {
    message.warning(nameLengthInvalid);
    return;
  }
  if (!editProject.application || !editProject.application.id) {
    message.warning(notSelectError);
    return;
  }
  yield put(ACTIONS.setSaveLoading(true));
  const rs = yield call(editProject.id ? API.updateProject : API.addProject, {
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
          ...pageInfo,
          search: '',
        }),
      );
    }
  } else {
    message.error(rs.msg || fetchListFailed);
  }
  yield put(ACTIONS.setSaveLoading(false));
}

function* deleteProject(action: ProjectListActionType) {
  const { id, applicationId } = action.payload as { id: string; applicationId: string };
  const { pageInfo, projectList } = store.getState().group.project.list;
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
    yield put(ACTIONS.fetchProjectList({ ...pageInfo, page, search: '' }));
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApps), handleFetchApp);
  yield takeLatest(getType(ACTIONS.fetchProjectList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveProject), save);
  yield takeLatest(getType(ACTIONS.deleteProject), deleteProject);
}

export default function* rootSaga() {
  yield all([watch()]);
}
