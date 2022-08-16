import { message } from 'antd';
import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/main';
import { fetchAppDetail } from '@/apis/application/common';
import * as API from '@/apis/builder/content';
import { clonePage } from '@/apis/builder/page';
import { fetchFileDetail } from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import { store } from '@/store/index';
import { BuilderContentActionType } from '@/store/reducers/builder/main';
import {
  ApplicationFetchRes,
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
  VariableEntity,
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
      extend = result.data;
    }
  }
  let pageContent = data;

  // TODO: need to clean
  let pageNode = data?.content?.schemas?.find((item) => item.name === 'page' || item.name === '');
  if (!pageNode) {
    pageNode = extend?.content?.schemas?.find((item) => item.name === 'page' || item.name === '');
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
  });

  return { state, extend };
}

function* handleFetchContent(action: BuilderContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, id, type = 'page' } = action.payload as ContentFetchParams;
  const isPage = type === 'page';
  const res: ContentFetchedRes = yield call(
    isPage ? API.fetchPageBuildVersion : API.fetchTemplateBuildVersion,
    {
      applicationId,
      id,
    },
  );

  if (res.code === 200) {
    // backup
    yield put(ACTIONS.pushContent(res.data));
    // init state
    const { state, extend }: { state: FormattedData; extend: PageContent } = yield call(afterFetch, {
      ...res.data,
    } as PageContent);

    // TODO: need to clean
    const pageNode = Object.values(state.originPageNodeMap).find(
      (item) => item.name === 'page' || item.name === '',
    );
    if (pageNode) {
      pageNode.name = 'page';
    }
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

function* handleSaveContent() {
  yield put(ACTIONS.updateSaveLoading(true));

  yield delay(500);

  const { application, file, pageContent, localVariables, pageNode } = store.getState().builder.main;
  const appId = application?.id || '';
  const relations = {
    ...pageContent.relations,
    variables: (pageContent.relations.variables || []).concat(localVariables as VariableEntity[]),
  };

  // get the need save content, filter props
  const needSaved = getSaveContent(pageContent, { pageNode });
  const validate = validateContent(needSaved, { relations });
  if (!validate) {
    yield put(ACTIONS.updateSaveLoading(false));
    return null;
  }

  const res: ContentFetchedRes = yield call(
    file.type === 'page' ? API.savePageContent : API.saveTemplateContent,
    {
      applicationId: appId,
      id: needSaved.content.id,
      content: needSaved.content,
    } as ContentSaveParams,
  );

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();
  if (res.code === 200) {
    message.success(saveSuccess);
    yield put(ACTIONS.updateEditState(false));
    yield put(
      ACTIONS.fetchContent({ applicationId: appId, id: needSaved.content.id, type: file.type || 'page' }),
    );
  } else {
    message.error(saveFailed);
    return null;
  }
  yield put(ACTIONS.updateSaveLoading(false));
}

function* handlePublishContent() {
  yield put(ACTIONS.updatePublishing(true));
  const { application, file, pageContent, content, editStatus = false } = store.getState().builder.main;
  const appId = application?.id;
  if (editStatus) {
    yield put(ACTIONS.saveContent());
  }

  // recheck saved
  const {
    global: { publishFailed, publishSuccess },
    builder: { saveTips },
  } = getBusinessI18n();
  const reCheck = store.getState().builder.main.editStatus;
  if (reCheck) {
    message.warn(saveTips);
    return;
  }

  const res: ContentFetchedRes = yield call(file.type === 'page' ? API.publishPage : API.publishTemplate, {
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
  const { application, content, file, pageNode } = store.getState().builder.main;
  yield put(ACTIONS.pushPageNode(data));
  if (application && application.id && content && content.id) {
    const { tpl: newTpl = '' } = data.directive || {};
    const { directive } = pageNode || {};
    const oldTpl = directive?.tpl;
    if (newTpl && newTpl !== oldTpl) {
      // save first
      yield put(ACTIONS.saveContent());
      yield delay(200);
      yield put(
        ACTIONS.fetchContent({
          applicationId: application.id || '',
          id: content.id,
          type: file.type || 'page',
        }),
      );
    }
  }
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
}

export default function* rootSaga() {
  yield all([watch()]);
}
