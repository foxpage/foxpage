import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/content';
import * as APPLICATION_API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import * as API from '@/apis/project';
import { fetchLiveComponentList } from '@/apis/builder/component';
import { updateBlockContent, addBlockContent, fetchBlockContents } from '@/apis/builder/block';
import { FileType, BLOCK_COMPONENT_NAME, PAGE_COMPONENT_NAME } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationProjectsContentActionType } from '@/reducers/applications/detail/projects/content';
import { store } from '@/store/index';
import { initRootContentNode } from '@/store/sagas/builder/utils'; 
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  FilesFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ParentFileFetchParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
} from '@/types/index';

function* handleFetchList(action: ApplicationProjectsContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, fileId, fileType = FileType.page } = action.payload as ProjectContentFetchParams;
  const apis = {
    [FileType.page]: API.fetchPageContents,
    [FileType.template]: API.fetchTemplateContents,
    [FileType.block]: fetchBlockContents
  }
  const res = yield call(apis[fileType], {
    applicationId,
    fileId,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushContentList(res.data));
  } else {
    const {
      content: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSave(action: ApplicationProjectsContentActionType) {
  const { applicationId, fileId, fileType = FileType.page } = action.payload as ProjectContentFetchParams;
  const { editContent: content } = store.getState().applications.detail.projects.content;
  const {
    global: { nameError, saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (!content?.title) {
    message.warn(nameError);
    return;
  }

  yield put(ACTIONS.updateSaveLoading(true));

  let params: any = {
    ...content,
    extendId: !content.extendId ? undefined : content.extendId,
    fileId,
    applicationId,
  };
  if (typeof content?.oneLocale === 'undefined')
    params = {
      ...params,
      oneLocale: true,
    };
  const isNew = !content.id;
  const isExtend = !!content.extendId;
  const fileTypeRootNodeMap: Record<string, string> = {
    [FileType.page]: PAGE_COMPONENT_NAME,
    [FileType.block]: BLOCK_COMPONENT_NAME
  }
  // create new root content node for base and content without extendId
  if (isNew && !isExtend && fileTypeRootNodeMap[fileType]) {
    const componentName = fileTypeRootNodeMap[fileType];
    const { data: components } = yield call(fetchLiveComponentList, {
      applicationId,
      type: ["component", "systemComponent"],
      search: componentName
    });
    const component = components.find(item => item.name === componentName);
    if (component) {
        params = {
        ...params,
        content: initRootContentNode(component)
      };
    }
  }

  const apis = {
    [FileType.page]: [API.updatePageContent, API.addPageContent],
    [FileType.template]: [API.updateTemplateContent, API.addTemplateContent],
    [FileType.block]: [updateBlockContent, addBlockContent]
  }
  const saveApi = content.id ? apis[fileType][0] : apis[fileType][1];
  const res = yield call(saveApi, params);

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.openEditDrawer(false));
    yield put(ACTIONS.fetchContentList({ applicationId, fileId, fileType }));
  } else {
    message.error(res.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDelete(action: ApplicationProjectsContentActionType) {
  const { applicationId, id, status, fileId, fileType } = action.payload as ProjectContentDeleteParams;
  const res = yield call(fileType === FileType.page ? API.deletePageContent : API.deleteTemplateContent, {
    applicationId,
    id,
    status,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    yield put(
      ACTIONS.fetchContentList({ applicationId: applicationId || '', fileId: fileId || '', fileType }),
    );
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handleFetchLocales(action: ApplicationProjectsContentActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const res = yield call(APPLICATION_API.fetchAppDetail, {
    applicationId,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushLocales(res.data.locales));
  } else {
    const {
      application: { fetchLocalesFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchLocalesFailed);
  }
}

function* handleCommitToStore(action: ApplicationProjectsContentActionType) {
  const { params, cb } = action.payload as { params: GoodsCommitParams; cb?: () => void };
  const res = yield call(API.commitToStore, params);

  const {
    global: { commitSuccess, commitFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(commitSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || commitFailed);
  }
}

function* handleOfflineFromStore(action: ApplicationProjectsContentActionType) {
  const { params, cb } = action.payload as { params: GoodsOfflineParams; cb?: () => void };
  const res = yield call(API.offlineFromStore, params);

  const {
    global: { revokeSuccess, revokeFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(revokeSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || revokeFailed);
  }
}

function* handleFetchFileDetail(action: ApplicationProjectsContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: FilesFetchParams };
  const res = yield call(API.fetchFileDetail, params);

  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(res.data[0]));
  } else {
    const {
      file: { fetchDetailFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchDetailFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleFetchParentFiles(action: ApplicationProjectsContentActionType) {
  const { params, cb } = action.payload as { params: ParentFileFetchParams; cb?: (folder) => void };
  const res = yield call(API.fetchParentFiles, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushParentFiles(res.data));

    if (typeof cb === 'function') cb(res.data?.[0]);
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
  }
}

function* handleFetchAuthList(action: ApplicationProjectsContentActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const res = yield call(AUTH_API.authorizeFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushAuthList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleSaveAuth(action: ApplicationProjectsContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeAdd, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    message.error(res.msg || addFailed);
  }
}

function* handleDeleteAuth(action: ApplicationProjectsContentActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handleFetchAuthUserList(action: ApplicationProjectsContentActionType) {
  const { params } = action.payload as { params: AuthorizeUserFetchParams };
  const res = yield call(AUTH_API.authorizeUserFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushUserList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchContentList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveContent), handleSave);
  yield takeLatest(getType(ACTIONS.deleteContent), handleDelete);
  yield takeLatest(getType(ACTIONS.fetchLocales), handleFetchLocales);
  yield takeLatest(getType(ACTIONS.commitFileToStore), handleCommitToStore);
  yield takeLatest(getType(ACTIONS.offlineFileFromStore), handleOfflineFromStore);
  yield takeLatest(getType(ACTIONS.fetchFileDetail), handleFetchFileDetail);
  yield takeLatest(getType(ACTIONS.fetchParentFiles), handleFetchParentFiles);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchAuthUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
