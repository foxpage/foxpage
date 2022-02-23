import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/detail';
import { deleteFile } from '@/apis/group/file';
import * as API from '@/apis/group/project';
import { FileTypeEnum } from '@/constants/index';
import { defaultSuffix } from '@/pages/common/constant/FileType';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectFileActionType } from '@/reducers/group/project/detail';
import { store } from '@/store/index';
import { ProjectFileDeleteParams, ProjectFileSaveParams, ProjectFileSearchParams } from '@/types/project';

function* handleFetchList(action: ProjectFileActionType) {
  const { page = 1, search = '', size = 10, applicationId, folderId } = action.payload as ProjectFileSearchParams;
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
  const { editFile, pageInfo } = store.getState().group.project.detail;
  if (!editFile.type) {
    message.warning(typeInvalid);
    return;
  }
  if (!editFile.name) {
    message.warning(nameInvalid);
    return;
  }

  yield put(ACTIONS.setSaveLoading(true));

  const api =
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
  const { pageInfo } = store.getState().group.project.detail;
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

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchFileList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveFile), save);
  yield takeLatest(getType(ACTIONS.deleteFile), handleDeleteFile);
}

export default function* rootSaga() {
  yield all([watch()]);
}
