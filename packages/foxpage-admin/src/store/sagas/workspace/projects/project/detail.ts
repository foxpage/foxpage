import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/detail';
import * as AUTH_API from '@/apis/auth';
import { deleteFile } from '@/apis/group/file';
import * as API from '@/apis/group/project';
import { FileTypeEnum } from '@/constants/index';
import { defaultSuffix } from '@/pages/common/constant/FileType';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectFileActionType } from '@/reducers/workspace/projects/project/detail';
import { store } from '@/store/index';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
  ProjectFileSearchParams,
} from '@/types/index';

function* handleFetchList(action: ProjectFileActionType) {
  const {
    page = 1,
    search = '',
    size = 10,
    applicationId,
    folderId,
  } = action.payload as ProjectFileSearchParams;
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.setLoading(true));
  const rs = yield call(API.getProjectFiles, {
    page,
    search,
    size,
    applicationId,
    id: folderId,
  });
  if (rs.code === 200) {
    yield put(ACTIONS.pushFileList(rs.data.files, rs.pageInfo));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* save(action: ProjectFileActionType) {
  const {
    global: { fetchListFailed },
    application: { nameInvalid, typeInvalid },
  } = getBusinessI18n();
  const { folderId, applicationId } = action.payload as ProjectFileSaveParams;
  const { editFile, pageInfo } = store.getState().workspace.projects.project.detail;
  if (!editFile.type) {
    message.warning(typeInvalid);
    return;
  }
  if (!editFile.name) {
    message.warning(nameInvalid);
    return;
  }

  yield put(ACTIONS.setSaveLoading(true));

  const api: any =
    editFile.type === FileTypeEnum.page
      ? editFile.id
        ? API.updatePage
        : API.addPage
      : editFile.id
      ? API.updateTemplate
      : API.addTemplate;

  const rs = yield call(api, {
    id: editFile.id,
    name: editFile.name,
    folderId,
    applicationId,
    tags: editFile.tags,
    suffix: editFile.suffix || (defaultSuffix[editFile.type] as string),
  });
  if (rs.code === 200) {
    yield put(ACTIONS.setAddFileDrawerOpenStatus(false));
    yield put(
      ACTIONS.fetchFileList({
        ...pageInfo,
        search: '',
        folderId,
        applicationId,
      }),
    );
  } else {
    message.error(rs.msg || fetchListFailed);
  }
  yield put(ACTIONS.setSaveLoading(false));
}

function* handleDeleteFile(action: ProjectFileActionType) {
  const { id, applicationId, folderId } = action.payload as ProjectFileDeleteParams;
  const { pageInfo } = store.getState().workspace.projects.project.detail;
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const rs = yield call(deleteFile, {
    id,
    applicationId,
    status: true,
  });
  if (rs.code === 200) {
    message.success(deleteSuccess);
    yield put(
      ACTIONS.fetchFileList({
        ...pageInfo,
        search: '',
        folderId,
        applicationId,
      }),
    );
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleAuthFetchList(action: ProjectFileActionType) {
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

function* handleAuthAdd(action: ProjectFileActionType) {
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

function* handleAuthDelete(action: ProjectFileActionType) {
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

function* handleAuthUserFetchList(action: ProjectFileActionType) {
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
  yield takeLatest(getType(ACTIONS.fetchFileList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveFile), save);
  yield takeLatest(getType(ACTIONS.deleteFile), handleDeleteFile);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleAuthFetchList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleAuthUserFetchList);
  yield takeLatest(getType(ACTIONS.authAddUser), handleAuthAdd);
  yield takeLatest(getType(ACTIONS.authDeleteUser), handleAuthDelete);
}

export default function* rootSaga() {
  yield all([watch()]);
}
