import { message } from 'antd';
import { Map } from 'immutable';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import * as API from '../../../../../apis/group/application/details/files';
import { shortId } from '../../../../../utils';
import * as ACTIONS from '../../../../actions/group/application/details/files';
import { store } from '../../../../index';

const PAGE_LIMIT = 10;

const orderMap: any = {
  ascend: 'ASC',
  descend: 'DESC',
};

function* handleFetchFileInfo(action: any): any {
  const { appId, id, cb } = action;
  const rs = yield call(API.fetchFileInfo, {
    appId,
    id,
  });
  if (rs.code === 200) {
    if (typeof cb === 'function') {
      cb(rs.data);
    }
  } else {
    message.error(rs.msg || 'Fetch info failed.');
  }
}

function* handleFetchRes(action: any): any {
  // const {
  //   // appId,
  //   // id,
  //   // pageLimit = PAGE_LIMIT,
  //   // pageNo = store.getState().group.application.details.files.get('pageNo') || 1,
  //   sorter,
  // } = action;

  // const { field, order } = sorter || {};
  // const sort = {
  //   [field]: orderMap[order],
  // };

  yield put({
    type: ACTIONS.UPDATE_LOADING,
    value: true,
  });
  // const rs = yield call(API.fetchList, {
  //   appId,
  //   id,
  //   pageNo,
  //   pageLimit,
  //   sort,
  // });
  const rs: any = {
    data: {
      folders: [
        {
          id: '1',
          name: 'folder34343',
          intro: 'string',
          applicationId: '2',
          parentFolder: 'string',
          creator: 'sqjing@313.com',
          createTime: '2019-10-24T06:03:04.000Z',
          updateTime: '2019-10-24T06:03:04.000Z',
          deleted: 'string',
          locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK', 'ko_KR'],
        },
        {
          id: '2',
          name: 'folder34343',
          intro: 'string',
          applicationId: '2',
          parentFolder: 'string',
          creator: 'sqjing@3131.com',
          createTime: '2019-10-25T06:03:04.000Z',
          updateTime: '2019-10-25T06:03:04.000Z',
          deleted: 'string',
          locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK', 'ko_KR'],
        },
      ],
      files: [
        {
          id: '3',
          name: 'file42424',
          intro: 'string',
          applicationId: 'string',
          type: 2,
          suffix: 'string',
          folderId: 'string',
          creator: 'sqjing@3131.com',
          createTime: '2019-10-23T06:03:04.000Z',
          updateTime: '2019-10-23T06:03:04.000Z',
          deleted: 'string',
          locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK'],
        },
        {
          id: '4',
          name: 'file42424',
          intro: 'string',
          applicationId: 'string',
          type: 2,
          suffix: 'string',
          folderId: 'string',
          creator: 'sqjing@3232.com',
          createTime: '2019-10-24T06:03:04.000Z',
          updateTime: '2019-10-24T06:03:04.000Z',
          deleted: 'string',
          locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK'],
        },
      ],
    },
    code: 200,
    mgs: '',
  };
  if (rs.code === 200) {
    yield put({
      type: ACTIONS.PUSH_LIST_INFO,
      data: rs.data,
    });
  } else {
    message.error(rs.msg || 'Fetch info failed.');
  }
  yield put({
    type: ACTIONS.UPDATE_LOADING,
    value: false,
  });
}

function* handleFetchBreadCrumb(action: any): any {
  const { appId, url, cb } = action;
  yield put({
    type: ACTIONS.UPDATE_LOADING,
    value: true,
  });
  yield put({
    type: ACTIONS.SELECT_ID,
    ids: [],
  });
  // const rs = yield call(API.fetchBreadCrumb, {
  //   appId,
  //   filePath: url,
  // });
  const rs: any = {
    data: [],
    code: 200,
  };
  if (rs.code === 200) {
    yield put({
      type: ACTIONS.PUSH_BREAD_CRUMB_INFO,
      data: rs.data,
      appId,
    });
    yield put({
      type: ACTIONS.UPDATE_VALUE,
      name: 'curUrl',
      value: url,
    });
    if (typeof cb === 'function') {
      cb(rs.data[rs.data.length - 1]);
    }
  } else {
    message.error(rs.msg || 'Fetch info failed.');
    yield put({
      type: ACTIONS.FETCH_BREAD_CRUMB_ERROR,
    });
    yield put({
      type: ACTIONS.UPDATE_LOADING,
      value: false,
    });
  }
}

function* handleUpdateFileInfo(action: any): any {
  const {
    appId,
    parentId,
    params: { id, idx, name, type, businessType, suffix, conditions },
    cb,
  } = action;

  const rs = yield call(API.upInsertPage, {
    params: {
      idx,
      id: id || shortId(),
      name,
      appId,
      suffix,
      locales: [],
      type,
      businessType,
      folderId: parentId,
      conditions,
    },
  });

  if (rs.code === 200) {
    message.success('Save succeed.');
    yield put({
      type: ACTIONS.CLOSE_FILE_DRAWER,
    });
    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || 'Save failed.');
  }
}

function* handleUpdateFolderInfo(action: any): any {
  const {
    appId,
    params: { id, idx, name },
  } = action;
  const state: any = store.getState().group.application.details.files.toJS();
  const {
    curBread: { id: parentId },
    pageNo,
  } = state;
  const rs = yield call(API.upInsertFolder, {
    params: {
      idx,
      id: id || shortId(),
      name,
      appId,
      folderId: parentId,
    },
  });

  if (rs.code === 200) {
    message.success('Save succeed.');
    yield put({
      type: ACTIONS.CLOSE_FOLDER_DRAWER,
    });
    yield* handleFetchRes({ appId, id: parentId, pageNo });
  } else {
    message.error(rs.msg || 'Save failed.');
  }
}

function getNewPageNo(res = []) {
  const fileData = store.getState().group.application.details.files || Map();
  const list: any = fileData.get('list') || [];
  let pageNo: any = fileData.get('pageNo') || 1;
  const counts = res.length;
  if (list.length === counts) {
    pageNo = pageNo > 1 ? pageNo - 1 : 1;
  }
  return pageNo;
}

function* handleRemoveRes(action: any): any {
  const { files = [], folders = [], appId, cb } = action;
  const rs = yield call(API.deleteFoldersAndFiles, {
    pages: {
      folder: folders,
      file: files,
    },
    appId,
  });

  if (rs.code === 200) {
    message.success('Remove succeed.');

    if (typeof cb === 'function') {
      cb(getNewPageNo(files.concat(folders)));
    }
  } else {
    message.error(rs.msg || 'Remove failed.');
  }
}

function* handleMoveRes(action: any): any {
  const { appId, ids = [], folderId, cb } = action;
  if (appId && ids && ids.length > 0) {
    const rs = yield call(API.resMoves, {
      appId,
      ids,
      folderId,
    });

    if (rs.code === 200) {
      message.success('Move succeed.');
      if (typeof cb === 'function') {
        cb(getNewPageNo(ids));
      }
      yield put({
        type: ACTIONS.CLOSE_MOVE_MODAL,
      });
    } else {
      message.error(rs.msg || 'Move failed.');
      yield put({
        type: ACTIONS.AFTER_MOVE_RES,
        moveIds: [],
      });
    }
  }
}

function* handleFetchFolderTree({ appId }: any): any {
  if (appId) {
    const rs = yield call(API.fetchFolderTree, {
      id: appId,
    });

    if (rs.code === 200) {
      yield put({
        type: ACTIONS.PUSH_FOLDER_TREE,
        data: rs.data,
      });
    } else {
      message.error(rs.msg || 'Fetch folder tree info failed.');
    }
  }
}

function* handleSearchRes(action: any): any {
  const {
    appId,
    // searchText,
    // pageLimit = PAGE_LIMIT,
    // pageNo = store.getState().group.application.details.files.get('pageNo') || 1,
  } = action;
  if (appId) {
    yield put({
      type: ACTIONS.UPDATE_LOADING,
      value: true,
    });
    // const rs = yield call(API.fileSearch, {
    //   appId,
    //   search: searchText ? searchText.split('.')[0] : '',
    //   pageLimit,
    //   pageNo,
    // });
    const rs: any = {
      data: {
        folders: [
          {
            id: '1',
            name: 'folder34343',
            intro: 'string',
            applicationId: '2',
            parentFolder: 'string',
            creator: 'sqjing@313131.com',
            createTime: '2019-10-24T06:03:04.000Z',
            updateTime: '2019-10-24T06:03:04.000Z',
            deleted: 'string',
            locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK', 'ko_KR'],
          },
          {
            id: '2',
            name: 'folder34343',
            intro: 'string',
            applicationId: '2',
            parentFolder: 'string',
            creator: 'sqjing@rerer.com',
            createTime: '2019-10-25T06:03:04.000Z',
            updateTime: '2019-10-25T06:03:04.000Z',
            deleted: 'string',
            locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK', 'ko_KR'],
          },
        ],
        files: [
          {
            id: '3',
            name: 'file42424',
            intro: 'string',
            applicationId: 'string',
            type: 2,
            suffix: 'string',
            folderId: 'string',
            creator: 'sqjing@rere.com',
            createTime: '2019-10-23T06:03:04.000Z',
            updateTime: '2019-10-23T06:03:04.000Z',
            deleted: 'string',
            locales: ['ja_JP', 'en_SG', 'th_TH', 'en_HK', 'zh_HK'],
          },
        ],
      },
      code: 200,
    };

    if (rs.code === 200) {
      yield put({
        type: ACTIONS.PUSH_LIST_INFO,
        data: { files: rs.data.files, folder: rs.data.folder, counts: rs.data.counts },
      });
    } else {
      message.error(rs.msg || 'Search info failed.');
    }
    yield put({
      type: ACTIONS.UPDATE_LOADING,
      value: false,
    });
  }
}

function* watch() {
  yield takeLatest(ACTIONS.FETCH_BREAD_CRUMB, handleFetchBreadCrumb);
  yield takeLatest(ACTIONS.FETCH_FILE_INFO, handleFetchFileInfo);

  yield takeLatest(ACTIONS.FETCH_LIST, handleFetchRes);
  yield takeLatest(ACTIONS.REMOVE_RES, handleRemoveRes);
  yield takeLatest(ACTIONS.MOVE_RES, handleMoveRes);
  yield takeLatest(ACTIONS.SEARCH_FILES, handleSearchRes);

  yield takeLatest(ACTIONS.UPDATE_FILE, handleUpdateFileInfo);
  yield takeLatest(ACTIONS.UPDATE_FOLDER, handleUpdateFolderInfo);

  yield takeLatest(ACTIONS.FETCH_FOLDER_TREE, handleFetchFolderTree);
}

export default function* rootSaga() {
  yield all([watch()]);
}
