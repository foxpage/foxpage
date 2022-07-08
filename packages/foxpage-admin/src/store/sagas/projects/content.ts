import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/content';
import { updatePageDsl } from '@/apis/builder';
import { getAppDetail } from '@/apis/group/application/list';
import { fetchFileDetail } from '@/apis/group/file';
import * as API from '@/apis/group/project/content';
import { commitToStore, offlineFromStore } from '@/apis/store/list';
import { FileTypeEnum } from '@/constants/index';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectContentActionType } from '@/reducers/projects/content';
import { store } from '@/store/index';
import {
  GoodsCommitParams,
  GoodsOfflineParams,
  ProjectContentDeleteParams,
  ProjectContentSearchParams,
  ProjectFileDetailFetchParams,
} from '@/types/index';
import shortId from '@/utils/short-id';

function* handleFetchList(action: ProjectContentActionType) {
  const { applicationId, fileId, fileType } = action.payload as ProjectContentSearchParams;
  const {
    content: { fetchFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateFetchLoading(true));
  const res = yield call(fileType === 'page' ? API.fetchPageContents : API.fetchTemplateContents, {
    applicationId,
    fileId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushContentList(res.data));
  } else {
    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateFetchLoading(false));
}

function* save(action: ProjectContentActionType) {
  const { applicationId, fileId, fileType } = action.payload as ProjectContentSearchParams;
  const {
    global: { saveSuccess, saveFailed, nameError, addFailed },
  } = getBusinessI18n();
  const state = store.getState().projects.content;
  const content = state.editContent;

  if (!content?.title) {
    message.warn(nameError);
    return;
  }

  yield put(ACTIONS.setSaveLoading(true));
  const saveApi = content.id
    ? fileType === FileTypeEnum.page
      ? API.updatePageContent
      : API.updateTemplateContent
    : fileType === FileTypeEnum.page
    ? API.addPageContent
    : API.addTemplateContent;
  const res = yield call(saveApi, {
    ...content,
    extendId: !content.extendId ? undefined : content.extendId,
    fileId,
    applicationId,
  });
  if (res.code === 200) {
    message.success(saveSuccess);
    yield put(ACTIONS.updateEditDrawerOpen(false));
    yield put(ACTIONS.fetchContentList({ applicationId, fileId, fileType }));

    // add root as default for content new base page/new locale page without extend
    if (!content.id && (content.isBase || (!content.isBase && !content.extendId))) {
      const addRootRes = yield call(updatePageDsl, {
        applicationId,
        content: {
          id: res.data.id,
          relation: {},
          schemas: [
            {
              children: [],
              id: `stru_${shortId(15)}`,
              name: '',
              props: { width: '100%', height: '100%' },
              type: '',
            },
          ],
        },
        id: res.data.id,
      });

      if (addRootRes.code !== 200) {
        message.error(addRootRes.msg || addFailed);
      }
    }
  } else {
    message.error(res.msg || saveFailed);
  }

  yield put(ACTIONS.setSaveLoading(false));
}

function* deleteContent(action: ProjectContentActionType) {
  const { applicationId, id, fileId, fileType } = action.payload as ProjectContentDeleteParams;
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const res = yield call(fileType === 'page' ? API.deletePageContent : API.deleteTemplateContent, {
    applicationId,
    id,
    status: true,
  });
  if (res.code === 200) {
    message.success(deleteSuccess);
    yield put(ACTIONS.fetchContentList({ applicationId, fileId, fileType }));
  } else {
    message.error(res.msg || deleteFailed);
  }

  yield put(ACTIONS.updateFetchLoading(false));
}

function* fetchLocales(action: ProjectContentActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const {
    application: { fetchLocalesFailed },
  } = getBusinessI18n();
  const res = yield call(getAppDetail, {
    applicationId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushLocales(res.data.locales));
  } else {
    message.error(res.msg || fetchLocalesFailed);
  }
}

function* handleCommitFileToStore(action: ProjectContentActionType) {
  const { id, applicationId, type, intro, onSuccess } = action.payload as GoodsCommitParams;
  const {
    global: { commitSuccess, commitFailed },
  } = getBusinessI18n();
  const rs = yield call(commitToStore, {
    id,
    applicationId,
    type,
    intro,
  });
  if (rs.code === 200) {
    message.success(commitSuccess);
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || commitFailed);
  }
}

function* handleOfflineFileToStore(action: ProjectContentActionType) {
  const { id, applicationId, onSuccess } = action.payload as GoodsOfflineParams;
  const {
    global: { revokeSuccess, revokeFailed },
  } = getBusinessI18n();
  const rs = yield call(offlineFromStore, {
    id,
    applicationId,
  });
  if (rs.code === 200) {
    message.success(revokeSuccess);
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(rs.msg || revokeFailed);
  }
}

function* handleFetchFileDetail(action: ProjectContentActionType) {
  const { applicationId, ids } = action.payload as ProjectFileDetailFetchParams;
  yield put(ACTIONS.updateFetchLoading(true));
  const {
    file: { fetchDetailFailed },
  } = getBusinessI18n();
  const rs = yield call(fetchFileDetail, {
    applicationId,
    ids,
  });
  if (rs.code === 200 && rs.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(rs.data[0]));
  } else {
    message.error(rs.msg || fetchDetailFailed);
  }
  yield put(ACTIONS.updateFetchLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchContentList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveContent), save);
  yield takeLatest(getType(ACTIONS.deleteContent), deleteContent);
  yield takeLatest(getType(ACTIONS.fetchLocales), fetchLocales);
  yield takeLatest(getType(ACTIONS.commitFileToStore), handleCommitFileToStore);
  yield takeLatest(getType(ACTIONS.offlineFileFromStore), handleOfflineFileToStore);
  yield takeLatest(getType(ACTIONS.fetchFileDetail), handleFetchFileDetail);
}

export default function* rootSaga() {
  yield all([watch()]);
}
