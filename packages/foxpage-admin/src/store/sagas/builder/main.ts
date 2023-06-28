import { message } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { all, call, delay, put, putResolve, select, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { fetchComponentVersionDetails } from '@/actions/builder/components';
import { fetchCatalog, saveMock } from '@/actions/builder/header';
import * as LOCKER_ACTIONS from '@/actions/builder/locker';
import * as ACTIONS from '@/actions/builder/main';
import { clearByContentChange } from '@/actions/builder/main';
import { fetchAppDetail } from '@/apis/application/common';
import * as VERSION_API from '@/apis/application/page/version';
import { fetchBlockBuildVersion, publishBlock, saveBlockContent } from '@/apis/builder/block';
import * as API from '@/apis/builder/content';
import { clonePage } from '@/apis/builder/page';
import { fetchFileDetail } from '@/apis/project';
import { FileType } from '@/constants/global';
import { FOXPAGE_USER_TICKET, RecordActionType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import * as HISTORY_ACTIONS from '@/store/actions/history';
import * as RECORD_ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import { BuilderContentActionType } from '@/store/reducers/builder/main';
import {
  ApplicationFetchRes,
  CheckDSLParams,
  CheckDSLRes,
  ComponentMockDeleteParams,
  ContentCloneParams,
  ContentFetchedRes,
  ContentFetchParams,
  ContentPublishParams,
  ContentSavedRes,
  ContentSaveParams,
  EncryptRes,
  EncryptValidateRes,
  FilesFetchedResponse,
  FilesFetchParams,
  FormattedData,
  InitStateParams,
  LockerParams,
  LockerResponse,
  PageContent,
  PublishStatus,
  PublishSteps,
  ResponseBody,
  StructureNode,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

import { initState, validateContent } from './services';
import { generateStructureId, getNameVersions, getRootNode, getSaveContent } from './utils';

const HEART_BEAT_DELAY = 30 * 1000;
const LOCKER_NOTICE_COUNTER = 5 * 60 * 1000;

function* handleFetchApp(action: BuilderContentActionType) {
  // yield put(ACTIONS.updateLoading(true));

  const { id } = action.payload as { id: string };
  const res: ApplicationFetchRes = yield call(fetchAppDetail, {
    applicationId: id,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushApp(res.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();
    errorToast(res, fetchListFailed);
  }

  // yield put(ACTIONS.updateLoading(false));
}

function* handleFetchFile(action: BuilderContentActionType) {
  // yield put(ACTIONS.updateLoading(true));

  const { applicationId, ids = [] } = action.payload as FilesFetchParams;
  const res: FilesFetchedResponse = yield call(fetchFileDetail, {
    applicationId,
    ids,
  });

  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    yield put(ACTIONS.pushFile(res.data));
    if (!res.data || res.data.length === 0) {
      errorToast(res, fetchListFailed);
    }
  } else {
    errorToast(res, fetchListFailed);
  }
}

function* handleFetchLiveContent(action: BuilderContentActionType) {
  const { params } = action.payload as {
    params: ContentFetchParams;
  };
  const res: ContentFetchedRes = yield call(API.fetchPageLiveVersion, {
    ...params,
  });

  if (res.code === 200) {
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();
    errorToast(res, fetchListFailed);
    return null;
  }
}

async function afterFetch(data?: PageContent | null) {
  if (!data) {
    return null;
  }
  const application = store.getState().builder.main.application;
  if (!application) {
    return null;
  }

  // get extend content
  let extend: PageContent | undefined;
  const { extendId } = data.content?.extension || {};
  if (extendId) {
    const result = (await API.fetchPageLiveVersion({
      applicationId: application.id,
      id: extendId,
    })) as unknown as ResponseBody<PageContent>;
    if (result.code === 200) {
      extend = result.data; // 继承来的数据
    }
  }
  let pageContent = data;

  // TODO: need to clean
  let pageNode = getRootNode(data?.content?.schemas);
  if (!pageNode) {
    // 纯继承还没有被修改、保存过
    pageNode = getRootNode(extend?.content?.schemas);
    if (pageNode) {
      pageNode = {
        ...pageNode,
        id: generateStructureId(),
        children: [],
        extension: { extendId: pageNode.id },
      };
      pageContent = { ...data, content: { ...data.content, schemas: [...data.content.schemas, pageNode] } };
    }
  }

  // init state
  const initParams: InitStateParams = {
    application,
    locale: store.getState().builder.header.locale, // for parse
    components: store.getState().builder.component.components,
    extendPage: extend,
    file: store.getState().builder.main.file,
    rootNode: pageNode,
    parseInLocal: true,
  };
  const state = await initState(pageContent, initParams);

  return { state, extend, pageNode, pageContent, initParams };
}

async function checkToken(token?: string) {
  if (!token) return false;
  const { contentId } = store.getState().builder.header;
  const result: EncryptValidateRes = await API.checkToken({
    data: {
      contentId,
    },
    token,
  });
  if (result.code === 200) {
    return result.data.status;
  }
  return false;
}

function* handleLoadToken() {
  let token = localStorage.getItem(FOXPAGE_USER_TICKET);
  const { folderId } = store.getState().builder.header;
  const validate = yield call(checkToken, token as string);
  if (!validate) {
    const result: EncryptRes = yield call(API.fetchToken, {
      data: {
        folderId,
      },
    });
    if (result.code === 200) {
      token = result.data.token;
      localStorage.setItem(FOXPAGE_USER_TICKET, result.data.token);
    }
  }
}

function* handleFetchContent(action: ReturnType<typeof ACTIONS.fetchContent>) {
  yield put(ACTIONS.updateLoading(true));
  yield put(ACTIONS.loadToken());
  const { applicationId, id, type = 'page', versionId } = action.payload;
  // preview old version or build version
  const apis = versionId
    ? {
        [FileType.page]: VERSION_API.fetchPageVersionDetail,
        [FileType.template]: VERSION_API.fetchTemplateVersionDetail,
        [FileType.block]: VERSION_API.fetchBlockVersionDetail,
      }
    : {
        [FileType.page]: API.fetchPageBuildVersion,
        [FileType.template]: API.fetchTemplateBuildVersion,
        [FileType.block]: fetchBlockBuildVersion,
      };
  const res: ContentFetchedRes = yield call(apis[type], {
    applicationId,
    id,
    versionId,
  });

  if (res.code === 200) {
    // backup
    yield put(ACTIONS.pushContent(res.data));
    if (res.data) yield put(ACTIONS.updateServerContentTime(res.data.contentUpdateTime));
    // init state
    const { state, extend, pageNode, pageContent, initParams } = yield call(afterFetch, {
      ...res.data,
    } as PageContent);

    yield put(ACTIONS.pushPageNode(pageNode || null));
    yield put(ACTIONS.pushLiveContent(extend));
    yield put(ACTIONS.pushFormatData(state));
    yield put(ACTIONS.prasePageInServer(pageContent, initParams));

    // get name version details
    const nameVersions = getNameVersions(res.data?.content);
    if (nameVersions.length > 0) {
      yield put(fetchComponentVersionDetails({ applicationId, nameVersions }));
    }
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();
    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.completeFetched());
  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveContent(action: ReturnType<typeof ACTIONS.saveContent>) {
  const {
    delay: _delay = true,
    publish = false,
    autoSave = false,
    force = false,
  } = action.payload.data || {};
  const {
    application,
    file,
    pageContent,
    localVariables = [],
    pageNode,
    mock,
    serverUpdateTime,
    readOnly = false,
  } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  yield put(ACTIONS.updateSaveLoading(true));

  if (_delay) {
    yield delay(350);
  }

  try {
    const appId = application?.id || '';
    const relations = {
      ...pageContent.relations,
      variables: (pageContent?.relations?.variables || []).concat(localVariables),
    };

    // get the need save content, filter props
    let needSaved = getSaveContent(pageContent, { pageNode, clearVersion: !!publish });
    const validate = validateContent(needSaved, { relations });
    if (!validate) {
      yield put(ACTIONS.updateSaveLoading(false));
      return null;
    }

    // remove version
    if (needSaved?.content?.version) {
      delete needSaved.content.version;
    }
    if (needSaved?.content?.dslVersion) {
      delete needSaved.content.dslVersion;
    }

    // bind mock
    if (mock.id) {
      needSaved = { ...needSaved, content: { ...needSaved.content, extension: { mockId: mock.id } } };
    }

    const apis = {
      [FileType.page]: API.savePageContent,
      [FileType.template]: API.saveTemplateContent,
      [FileType.block]: saveBlockContent,
    };
    const res: ContentSavedRes = yield call(apis[file.type || 'page'], {
      applicationId: appId,
      id: needSaved.content.id,
      content: needSaved.content,
      ...(force ? {} : { contentUpdateTime: serverUpdateTime }),
    } as ContentSaveParams);

    const {
      global: { saveFailed, saveSuccess },
    } = getBusinessI18n();

    if (res.code === 200) {
      yield put(ACTIONS.updateEditState(false));
      yield put(ACTIONS.updateLockerState({ needUpdate: false }));
      // save record
      yield put(
        RECORD_ACTIONS.saveUserRecords({
          applicationId: appId,
          contentId: pageContent.contentId,
          logs: [],
        }),
      );

      // yield put(RECORD_ACTIONS.updateNodeUpdateRecordsIndex(-1));
      yield put(ACTIONS.pushContentOnly(res.data));
      yield put(LOCKER_ACTIONS.resetClientContentTime());

      if (publish) {
        yield put(ACTIONS.publishContent(true));
      }
      if (!publish && !autoSave) {
        message.success(saveSuccess);
      }
      yield put(ACTIONS.updateSaveLoading(false));
    } else {
      if (res.status === 2051908) {
        yield put(ACTIONS.updateLockerState({ needUpdate: true }));
      }
      errorToast(res, saveFailed);
      yield put(ACTIONS.updateSaveLoading(false));
      return null;
    }
  } catch (err) {
    console.error(err);
    yield put(ACTIONS.updateSaveLoading(false));
    return null;
  }
}

function* handlePublishContent(action: ReturnType<typeof ACTIONS.publishContent>) {
  const { application, file, pageContent, content, readOnly = false } = store.getState().builder.main;
  const { saved = false } = action.payload;
  // if (readOnly) {
  //   return;
  // }

  yield put(ACTIONS.updatePublishing(true));
  yield put(ACTIONS.updateShowPublishModal(true));

  const appId = application?.id;
  yield put(ACTIONS.pushPublishStep(PublishSteps.SAVE_BEFORE_PUBLISH));
  yield put(ACTIONS.pushPublishStatus(PublishStatus.PROCESSING));
  if (!saved) {
    yield put(ACTIONS.saveContent({ delay: false, publish: true }));
  }
  yield delay(500);

  yield put(ACTIONS.pushPublishStep(PublishSteps.CHECK_BEFORE_PUBLISH));
  const status = yield checkDSLBeforePublish();
  yield delay(500);

  if (!status) {
    return;
  }

  const {
    global: { publishFailed, publishSuccess },
  } = getBusinessI18n();

  const apis = {
    [FileType.page]: API.publishPage,
    [FileType.template]: API.publishTemplate,
    [FileType.block]: publishBlock,
  };

  yield put(ACTIONS.pushPublishStep(PublishSteps.PUBLISH_CONTENT));
  const params = readOnly
    ? {
        applicationId: appId,
        contentId: pageContent.contentId,
        versionNumber: pageContent.versionNumber,
      }
    : ({
        applicationId: appId,
        id: pageContent.id,
        status: 'release',
      } as ContentPublishParams);
  const res: ContentFetchedRes = yield call(
    readOnly ? API.setLiveVersion : apis[file.type || 'page'],
    params,
  );
  yield delay(500);

  if (res.code === 200) {
    message.success(publishSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.PAGE_PUBLISH, [params], {
        save: true,
        applicationId: appId,
        contentId: pageContent.contentId,
      }),
    );
    yield put(clearByContentChange(pageContent.id, true));
    yield put(ACTIONS.pushPublishStep(PublishSteps.PUBLISHED));
    yield put(ACTIONS.pushPublishStatus(PublishStatus.FINISH));
    yield put(
      ACTIONS.fetchContent({ applicationId: appId || '', id: content.id, type: file.type || 'page' }),
    );
    // refresh catalog
    const { applicationId, folderId } = store.getState().builder.header;
    if (!readOnly) yield put(fetchCatalog({ applicationId, folderId }));
    yield put(HISTORY_ACTIONS.resetHistory());

    // handle different response
    const versionId = readOnly ? res.data?.liveVersionId : res.data?.id;
    yield put(HISTORY_ACTIONS.initHistory({ applicationId, id: content.id }, versionId));
  } else {
    errorToast(res, publishFailed);
    yield put(ACTIONS.pushPublishStatus(PublishStatus.ERROR));
  }
  yield put(ACTIONS.updatePublishing(false));
}

function* checkDSLBeforePublish() {
  const { pageContent, application } = store.getState().builder.main;
  const res: CheckDSLRes = yield call(API.checkDslBeforePublish, {
    applicationId: application?.id,
    contentId: pageContent.contentId,
    versionId: pageContent.id,
  } as CheckDSLParams);

  const {
    global: { publishFailed },
  } = getBusinessI18n();
  if (res.code === 200 && res.data?.publishStatus) {
    return true;
  } else {
    errorToast(res, publishFailed);
    yield put(ACTIONS.pushPublishStatus(PublishStatus.ERROR));
    yield put(ACTIONS.pushPublishErrors(res.data));
    return false;
  }
}

function* handleCloneContent(actions: BuilderContentActionType) {
  const { contentId } = actions.payload as { contentId: string };
  const {
    global: { cloneSuccess, cloneFailed },
  } = getBusinessI18n();
  const { application, content, file } = store.getState().builder.main;
  const appId = application?.id || '';
  if (!appId) {
    return;
  }
  const res: ResponseBody = yield call(clonePage, {
    applicationId: appId,
    targetContentId: content.id,
    sourceContentId: contentId,
    includeBase: true,
  } as ContentCloneParams);
  if (res.code === 200) {
    message.success(cloneSuccess);
    yield put(ACTIONS.fetchContent({ applicationId: appId, id: content.id, type: file.type || 'page' }));
  } else {
    errorToast(res, cloneFailed);
  }
}

function* handlePageNodeChange(actions: BuilderContentActionType) {
  const { data } = actions.payload as { data: StructureNode };
  const { application, content, pageNode, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  yield put(ACTIONS.pushPageNode(data));
  if (application && application.id && content && content.id) {
    const { tpl: newTpl = '' } = data.directive || {};
    const { directive } = pageNode || {};
    const oldTpl = directive?.tpl;
    if (newTpl && newTpl !== oldTpl) {
      // save first
      yield put(ACTIONS.saveContent());
    }
  }
}

function* handleDeleteComponentMock(actions: BuilderContentActionType) {
  const { data } = actions.payload as { data: ComponentMockDeleteParams };
  // generate new mock data
  const { mock } = store.getState().builder.main;
  const _mock = _.cloneDeep(mock);
  _mock.schemas = _mock.schemas.filter((schema) => schema.id !== data.id);

  // save
  const { applicationId, folderId, contentId } = store.getState().builder.header;
  yield put(
    saveMock({
      applicationId,
      folderId,
      contentId,
      name: `mock_${contentId}`,
      content: _mock,
      refresh: true,
    }),
  );
}

function* handleHeartBeat(actions) {
  const { flag } = actions.payload;
  try {
    while (flag) {
      const {
        application,
        content,
        pageContent: { id: contentVersion },
        lockerState: { blocked },
      } = store.getState().builder.main;
      const params = {
        applicationId: application?.id,
        contentId: content.id,
        versionId: contentVersion,
      } as LockerParams;
      const res: LockerResponse = yield call(API.heartBeat, params);
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg);
      }
      const { status, operator, lockStatus, ...restData } = res.data;

      const newState = {
        preLocked: blocked,
        locked: lockStatus,
        blocked: !status,
        operator,
        ...restData,
      };
      yield put(ACTIONS.updateLockerState(newState));
      yield delay(HEART_BEAT_DELAY);
    }
    yield put(ACTIONS.resetLockerState());
  } catch (err) {
    console.error(err);
    yield put(ACTIONS.resetLockerState());
  }
}

export function* handleContentLock(actions) {
  const {
    application,
    content,
    lockerState,
    pageContent: { id: contentVersion },
    serverUpdateTime: updateTime,
    readOnly = false,
  } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  const { forceLock } = actions.payload;
  if (lockerState.locked && !forceLock) {
    return true;
  }
  try {
    const params = {
      applicationId: application?.id,
      contentId: content.id,
      versionId: contentVersion,
    } as LockerParams;
    const res: LockerResponse = yield call(API.lockEdit, params);
    // version update, need refresh
    if (res.code !== 200 || !res.data) {
      errorToast(res, res.msg || getBusinessI18n().global.lockFailed);
      return false;
    }
    const { status, operator, operationTime } = res.data;
    // if lock operation is failed, the other sagas will be blocked
    if (status === false) {
      yield putResolve(ACTIONS.updateLockerState({ blocked: !status, operator, operationTime }));
      return false;
    }
    // content is updated, need refresh
    if (dayjs(operationTime).isAfter(dayjs(updateTime))) {
      yield putResolve(ACTIONS.updateLockerState({ needUpdate: true }));
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('handleLock', err);
    return true;
  }
}

function* handleContentUnlock() {
  const {
    application,
    content,
    pageContent: { id: contentVersion },
    lockerState: { blocked },
  } = store.getState().builder.main;
  if (blocked) {
    return;
  }
  try {
    if (!application?.id || !content.id || !contentVersion) {
      return;
    }
    const params = {
      applicationId: application?.id,
      contentId: content.id,
      versionId: contentVersion,
    } as LockerParams;
    const res: LockerResponse = yield call(API.unlockEdit, params);
    if (res.code !== 200 || !res.data) {
      errorToast(res, res.msg || getBusinessI18n().global.unlockFailed);
      return;
    }
  } catch (err) {
    return;
  }
}

function* handleLockerManager(actions) {
  const { blocked, needUpdate } = yield select((state) => state.builder.main.lockerState);

  if (blocked || needUpdate) {
    return;
  }
  yield put(ACTIONS.resetLockerManager());
  if (actions.payload.flag) {
    yield delay(LOCKER_NOTICE_COUNTER);
    yield put(ACTIONS.setLockerManagerState({ noticeVisible: true }));
  }
}

function* guard(actions) {
  const {
    lockerState: { blocked },
    readOnly = false,
  } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  if (blocked) {
    const i18n = getBusinessI18n();
    message.error(i18n.content.lockedAlert);
    return;
  }
  const value = yield call(handleContentLock, { payload: { forceLock: false } });
  if (value !== false) {
    yield putResolve(ACTIONS.handleLockerManager());
    yield call(actions.payload.future);
    yield put(LOCKER_ACTIONS.updateClientContentTime(dayjs().toISOString()));
  }
}

function* handlePrasePageInServer(actions: BuilderContentActionType) {
  const { page, opt } = actions.payload as { page: PageContent; opt: InitStateParams };
  const formatted = (yield call(initState, page, { ...opt, parseInLocal: true })) as FormattedData;
  yield put(ACTIONS.pushRenderDSL(formatted.formattedSchemas));
  // get random string
  const randomStr = Math.random().toString(36).substr(2);
  yield put(ACTIONS.updateParseParams(randomStr, { page, opt }));
}

// just for test
function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApp), handleFetchApp);
  yield takeLatest(getType(ACTIONS.fetchFile), handleFetchFile);
  yield takeLatest(getType(ACTIONS.fetchContent), handleFetchContent);
  yield takeLatest(getType(ACTIONS.loadToken), handleLoadToken);
  yield takeLatest(getType(ACTIONS.fetchLiveContent), handleFetchLiveContent);
  yield takeLatest(getType(ACTIONS.saveContent), handleSaveContent);
  yield takeLatest(getType(ACTIONS.publishContent), handlePublishContent);
  yield takeLatest(getType(ACTIONS.checkDSLBeforePublish), checkDSLBeforePublish);
  yield takeLatest(getType(ACTIONS.cloneContent), handleCloneContent);
  yield takeLatest(getType(ACTIONS.updatePageNode), handlePageNodeChange);
  yield takeLatest(getType(ACTIONS.deleteComponentMock), handleDeleteComponentMock);
  yield takeLatest(getType(ACTIONS.handleHeartBeatCheck), handleHeartBeat);
  yield takeLatest(getType(ACTIONS.lockContent), handleContentLock);
  yield takeLatest(getType(ACTIONS.unlockContent), handleContentUnlock);
  yield takeLatest(getType(ACTIONS.handleLockerManager), handleLockerManager);
  yield takeLatest(getType(ACTIONS.guard), guard);
  yield takeLatest(getType(ACTIONS.prasePageInServer), handlePrasePageInServer);
}

export default function* rootSaga() {
  yield all([watch()]);
}
