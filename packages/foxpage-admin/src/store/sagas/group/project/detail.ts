import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/detail';
import { deleteFile } from '@/apis/group/file';
import * as API from '@/apis/group/project';
import { FileTypeEnum } from '@/constants/index';
import { defaultSuffix } from '@/pages/common/constant/FileType';
import { ProjectFileActionType } from '@/reducers/group/project/detail';
import { store } from '@/store/index';
import { ProjectFileDeleteParams, ProjectFileSaveParams, ProjectFileSearchParams } from '@/types/project';

function* handleFetchList(action: ProjectFileActionType) {
  const { page = 1, search = '', size = 10, applicationId, folderId } = action.payload as ProjectFileSearchParams;

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
    message.error(rs.msg || 'Fetch list failed');
  }
}

function* save(action: ProjectFileActionType) {
  const { folderId, applicationId } = action.payload as ProjectFileSaveParams;
  const { editFile, pageInfo } = store.getState().group.project.detail;
  if (!editFile.type) {
    message.warning('Please select type');
    return;
  }
  if (!editFile.name) {
    message.warning('Please input name');
    return;
  }
  if (editFile.name.length < 5) {
    message.warning('name must be longer than or equal to 5 characters');
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
    message.error(rs.msg || 'Fetch list failed');
  }
  yield put(ACTIONS.setSaveLoading(false));
}

function* handleDeleteFile(action: ProjectFileActionType) {
  const { id, applicationId, folderId } = action.payload as ProjectFileDeleteParams;
  const { pageInfo } = store.getState().group.project.detail;

  const rs = yield call(deleteFile, {
    id,
    applicationId,
    status: true,
  });
  if (rs.code === 200) {
    message.success('Delete succeed');
    yield put(
      ACTIONS.fetchFileList({
        ...pageInfo,
        search: '',
        folderId,
        applicationId,
      }),
    );
  } else {
    message.error(rs.msg || 'Delete failed');
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
