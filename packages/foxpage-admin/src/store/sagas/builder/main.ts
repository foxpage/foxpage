import { message } from 'antd';
import _ from 'lodash';
import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { fetchCatalog, saveMock } from '@/actions/builder/header';
import * as ACTIONS from '@/actions/builder/main';
import { fetchAppDetail } from '@/apis/application/common';
import { fetchBlockBuildVersion, publishBlock, saveBlockContent } from '@/apis/builder/block';
import * as API from '@/apis/builder/content';
import { clonePage } from '@/apis/builder/page';
import { fetchFileDetail } from '@/apis/project';
import { FileType } from '@/constants/global';
import { getBusinessI18n } from '@/foxI18n/index';
import { getRootNode } from '@/sagas/builder/utils';
import { store } from '@/store/index';
import { BuilderContentActionType } from '@/store/reducers/builder/main';
import {
  ApplicationFetchRes,
  ComponentMockDeleteParams,
  ContentCloneParams,
  ContentFetchedRes,
  ContentFetchParams,
  ContentPublishParams,
  ContentSaveParams,
  FilesFetchedResponse,
  FilesFetchParams,
  FormattedData,
  PageContent,
  ResponseBody,
  StructureNode,
} from '@/types/index';

import { initState, validateContent } from './services';
import { generateStructureId, getSaveContent } from './utils';

function* handleFetchApp(action: BuilderContentActionType) {
  yield put(ACTIONS.updateLoading(true));

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
    message.error(fetchListFailed);
  }

  // yield put(ACTIONS.updateLoading(false));
}

function* handleFetchFile(action: BuilderContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, ids = [] } = action.payload as FilesFetchParams;
  const res: FilesFetchedResponse = yield call(fetchFileDetail, {
    applicationId,
    ids,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushFile(res.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();
    message.error(fetchListFailed);
  }

  // yield put(ACTIONS.updateLoading(false));
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
    message.error(fetchListFailed);
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
    const result = ((await API.fetchPageLiveVersion({
      applicationId: application.id,
      id: extendId,
    })) as unknown) as ResponseBody<PageContent>;
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
  const state = await initState(pageContent, {
    application,
    locale: store.getState().builder.header.locale, // for parse
    components: store.getState().builder.component.components,
    extendPage: extend,
    file: store.getState().builder.main.file,
    rootNode: pageNode,
  });

  return { state, extend, pageNode };
}

function* handleFetchContent(action: BuilderContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, id, type = 'page' } = action.payload as ContentFetchParams;
  const apis = {
    [FileType.page]: API.fetchPageBuildVersion,
    [FileType.template]: API.fetchTemplateBuildVersion,
    [FileType.block]: fetchBlockBuildVersion,
  };
  const res: ContentFetchedRes = yield call(apis[type], {
    applicationId,
    id,
  });

  if (res.code === 200) {
    // backup
    yield put(ACTIONS.pushContent(res.data));
    // init state
    const {
      state,
      extend,
      pageNode,
    }: { state: FormattedData; extend: PageContent; pageNode: StructureNode } = yield call(afterFetch, {
      ...res.data,
    } as PageContent);

    yield put(ACTIONS.pushPageNode(pageNode || null));
    yield put(ACTIONS.pushLiveContent(extend));
    yield put(ACTIONS.pushFormatData(state));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();
    message.error(fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveContent(action: BuilderContentActionType) {
  const { delay: _delay = true, publish = false } = action.payload as { delay?: boolean; publish?: boolean };
  yield put(ACTIONS.updateSaveLoading(true));

  if (_delay) {
    yield delay(500);
  }

  const {
    application,
    file,
    pageContent,
    localVariables = [],
    pageNode,
    mock,
  } = store.getState().builder.main;
  const appId = application?.id || '';
  const relations = {
    ...pageContent.relations,
    variables: (pageContent.relations.variables || []).concat(localVariables),
  };

  // get the need save content, filter props
  let needSaved = getSaveContent(pageContent, { pageNode });
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
  const res: ContentFetchedRes = yield call(apis[file.type || 'page'], {
    applicationId: appId,
    id: needSaved.content.id,
    content: needSaved.content,
  } as ContentSaveParams);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();
  if (res.code === 200) {
    message.success(saveSuccess);
    yield put(ACTIONS.updateEditState(false));
    yield put(
      ACTIONS.fetchContent({ applicationId: appId, id: needSaved.content.id, type: file.type || 'page' }),
    );
    if (publish) {
      yield put(ACTIONS.publishContent());
    }
  } else {
    message.error(saveFailed);
    return null;
  }
  yield put(ACTIONS.updateSaveLoading(false));
}

function* handlePublishContent() {
  yield put(ACTIONS.updatePublishing(true));

  yield delay(500);

  const { application, file, pageContent, content, editStatus = false } = store.getState().builder.main;
  const appId = application?.id;
  if (editStatus) {
    yield put(ACTIONS.saveContent(false, true));
  }

  // recheck saved
  const reCheck = store.getState().builder.main.editStatus;
  if (reCheck) {
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
  const res: ContentFetchedRes = yield call(apis[file.type || 'page'], {
    applicationId: appId,
    id: pageContent.id,
    status: 'release',
  } as ContentPublishParams);

  if (res.code === 200) {
    // yield put(ACTIONS.pushContent(res.data));
    message.success(publishSuccess);
    yield put(
      ACTIONS.fetchContent({ applicationId: appId || '', id: content.id, type: file.type || 'page' }),
    );

    // refresh catalog
    const { applicationId, folderId } = store.getState().builder.header;
    yield put(fetchCatalog({ applicationId, folderId }));
  } else {
    message.error(publishFailed);
  }
  yield put(ACTIONS.updatePublishing(false));
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
  } as ContentCloneParams);
  if (res.code === 200) {
    message.success(cloneSuccess);
    yield put(ACTIONS.fetchContent({ applicationId: appId, id: content.id, type: file.type || 'page' }));
  } else {
    message.error(cloneFailed);
  }
}

function* handlePageNodeChange(actions: BuilderContentActionType) {
  const { data } = actions.payload as { data: StructureNode };
  const { application, content, pageNode } = store.getState().builder.main;
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

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApp), handleFetchApp);
  yield takeLatest(getType(ACTIONS.fetchFile), handleFetchFile);
  yield takeLatest(getType(ACTIONS.fetchContent), handleFetchContent);
  yield takeLatest(getType(ACTIONS.fetchLiveContent), handleFetchLiveContent);
  yield takeLatest(getType(ACTIONS.saveContent), handleSaveContent);
  yield takeLatest(getType(ACTIONS.publishContent), handlePublishContent);
  yield takeLatest(getType(ACTIONS.cloneContent), handleCloneContent);
  yield takeLatest(getType(ACTIONS.updatePageNode), handlePageNodeChange);
  yield takeLatest(getType(ACTIONS.deleteComponentMock), handleDeleteComponentMock);
}

export default function* rootSaga() {
  yield all([watch()]);
}
