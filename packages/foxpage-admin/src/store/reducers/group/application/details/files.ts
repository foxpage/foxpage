import { fromJS, List, Map } from 'immutable';

import fileTypes from '../../../../../configs/file-types';
import { shortId } from '../../../../../utils';
import periodFormat from '../../../../../utils/period-format';
import * as ACTIONS from '../../../../actions/group/application/details/files';

const NAME_REG = /^[0-9a-z_-]+$/;
const initialState = Map();

function initTerms(key: string, relation: string, value: string) {
  return {
    id: shortId(),
    key,
    relation,
    value,
    defaultValue: {},
  };
}

function initCondition(type: any, value: string) {
  let terms: { id: string; key: any; relation: any; value: any; defaultValue: unknown }[] = [];
  const isApp = fileTypes.APP === type;
  if (isApp) {
    terms = [initTerms('{{request.head.version}} ', 'gt_eq', ''), initTerms('{{request.head.version}} ', 'lt_eq', '')];
  }
  return {
    id: shortId(),
    type: 1,
    list: [
      initTerms(fileTypes.getPathKeys(type), 'eq', isApp ? '' : value || ''),
      initTerms(fileTypes.getPathKeys(type), 'eq', ''),
      ...terms,
    ],
    weight: 200,
  };
}

function getPath(path: unknown, value: any, suffix: any) {
  let pathValue = '';
  if (path && value) {
    pathValue = `${path}${value}.${suffix}`;
  } else if (!path && value) {
    pathValue = `/${value}.${suffix}`;
  }
  return pathValue;
}

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ACTIONS.SET_DEFAULT_BREAD_CRUMB: {
      return state.set('breadCrumb', [{ name: 'Application list', link: '/#/group/application/list' }]);
    }
    case ACTIONS.CLEAR_ALL: {
      return initialState;
    }
    case ACTIONS.UPDATE_LOADING: {
      return state.set('loading', action.value);
    }
    case ACTIONS.UPDATE_VALUE: {
      const { name, value } = action;
      return state.set(name, value);
    }
    case ACTIONS.CHANGE_FILE_TYPE: {
      const { value } = action;
      return state
        .setIn(['optData', 'type'], Number(value))
        .setIn(['optData', 'businessType'], undefined)
        .setIn(['optData', 'suffix'], fileTypes.getSuffixs(value)[0] || 'html')
        .setIn(['optData', 'conditions'], List())
        .setIn(['optData', 'switchStatus'], false);
    }
    case ACTIONS.UPDATE_DRAWER_VALUE: {
      const { name, value } = action;
      if (name === 'name') {
        if (value !== '' && !NAME_REG.test(value)) {
          return state;
        }
        const type = state.getIn(['optData', 'type']);
        const searchText = state.get('searchText');
        if (fileTypes.isNeedPath(type) && fileTypes.APP === type && !searchText) {
          const conditions = state.getIn(['optData', 'conditions']) || List();
          if (conditions.size === 1) {
            // 只有一条path的时候，path目录值和输入的file name值同步
            const list = conditions.getIn([0, 'list']) || List();
            const idx = list.findIndex(
              (item: { get: (arg0: string) => string }) => item.get('key') === '{{urlobj.pathname}}',
            );
            if (idx > -1) {
              const pathValue = getPath(state.get('breadCrumbPath'), value, state.getIn(['optData', 'suffix']));
              return state
                .setIn(['optData', name], value)
                .setIn(['optData', 'conditions', 0, 'list', idx, 'value'], pathValue);
            }
          }
        }
      }

      if (name === 'suffix') {
        return state
          .setIn(['optData', name], value)
          .setIn(['optData', 'conditions'], List())
          .setIn(['optData', 'switchStatus'], false);
      }
      return state.setIn(['optData', name], value);
    }
    case ACTIONS.ADD_PATH: {
      let conditions = state.getIn(['optData', 'conditions']) || List();
      const fileName = state.getIn(['optData', 'name']);
      const type = state.getIn(['optData', 'type']);
      const pathValue = getPath(state.get('breadCrumbPath'), fileName, state.getIn(['optData', 'suffix']));
      conditions = conditions.push(fromJS(initCondition(type, pathValue)));
      return state.setIn(['optData', 'conditions'], conditions);
    }
    case ACTIONS.REMOVE_PATH: {
      const { id } = action;
      const conditions = state.getIn(['optData', 'conditions']) || List();
      const idx = conditions.findIndex((item: { get: (arg0: string) => any }) => item.get('id') === id);
      if (idx > -1) {
        return state.setIn(['optData', 'conditions'], conditions.delete(idx));
      }
      return state;
    }
    case ACTIONS.UPDATE_PATH: {
      const { id, termsId, value, keys = [] } = action;
      const conditions = state.getIn(['optData', 'conditions']) || List();
      const idx = conditions.findIndex((item: { get: (arg0: string) => any }) => item.get('id') === id);
      if (idx > -1) {
        const list = conditions.getIn([idx, 'list']);
        let termIdx = -1;
        if (list && list.size > 0) {
          termIdx = list.findIndex((item: { get: (arg0: string) => any }) => item.get('id') === termsId);
        }
        if (termIdx > -1) {
          const oldDefaultValue = list.getIn([termIdx, 'defaultValue']) || Map();
          let defaultValue = Map();
          if (keys.length > 0) {
            keys.forEach((key: unknown) => {
              defaultValue = defaultValue.set(key, oldDefaultValue.get(key) || '');
            });
          }
          return state
            .setIn(['optData', 'conditions', idx, 'list', termIdx, 'value'], value)
            .setIn(['optData', 'conditions', idx, 'list', termIdx, 'defaultValue'], defaultValue);
        }
      }
      return state;
    }
    case ACTIONS.UPDATE_DEFAULT_VALUE: {
      const { id, termsId, name, value } = action;
      const conditions = state.getIn(['optData', 'conditions']) || List();
      const idx = conditions.findIndex((item: { get: (arg0: string) => any }) => item.get('id') === id);
      if (idx > -1) {
        const list = conditions.getIn([idx, 'list']);
        let termIdx = -1;
        if (list && list.size > 0) {
          termIdx = list.findIndex((item: { get: (arg0: string) => any }) => item.get('id') === termsId);
        }
        if (termIdx > -1) {
          let defaultValue = list.getIn([termIdx, 'defaultValue']) || Map();
          defaultValue = defaultValue.set(name, value);
          return state.setIn(['optData', 'conditions', idx, 'list', termIdx, 'defaultValue'], defaultValue);
        }
      }
      return state;
    }
    case ACTIONS.CLEAR_PATH: {
      return state.setIn(['optData', 'conditions'], List());
    }
    case ACTIONS.SELECT_ID: {
      return state.set('selectedIds', action.ids);
    }
    case ACTIONS.OPEN_FOLDER_DRAWER: {
      return state.set('folderDrawerOpen', true).set('optData', fromJS(action.optData));
    }
    case ACTIONS.CLOSE_FOLDER_DRAWER: {
      return state.set('folderDrawerOpen', false).set('optData', undefined);
    }
    case ACTIONS.OPEN_FILE_DRAWER: {
      const { optData } = action;
      const switchStatus = optData.conditions && optData.conditions.length > 0;
      if (!optData.type) {
        Object.assign(optData, {
          type: 1,
          suffix: 'html',
          switchStatus,
        }); // default page type
      } else {
        Object.assign(optData, { switchStatus });
      }
      if (fileTypes.APP === optData.type && switchStatus) {
        // isApp
        optData.conditions.forEach((item: { list: string | any[] }) => {
          const newList: any = item.list.slice();
          const smallData = newList.find((i: { relation: string }) => i.relation === 'gt_eq');
          const largeData = newList.find((i: { relation: string }) => i.relation === 'lt_eq');
          if (!smallData) {
            newList.push(initTerms('{{request.head.version}} ', 'gt_eq', ''));
          }
          if (!largeData) {
            newList.push(initTerms('{{request.head.version}} ', 'lt_eq', ''));
          }
          Object.assign(item, { list: newList });
        });
      }
      return state.set('fileDrawerOpen', true).set('optData', fromJS(optData));
    }
    case ACTIONS.CLOSE_FILE_DRAWER: {
      return state.set('fileDrawerOpen', false).set('optData', undefined);
    }
    case ACTIONS.PUSH_LIST_INFO: {
      const { files = [], folders = [], counts } = action.data || {};
      const list = folders
        .map((item: { id: any; updateTime: any }) =>
          Object.assign(item, {
            isFolder: true,
            key: item.id,
            updateTime: periodFormat(item.updateTime, 'unknown'),
          }),
        )
        .concat(
          files.map((item: { id: any; updateTime: any }) =>
            Object.assign(item, {
              isFolder: false,
              key: item.id,
              updateTime: periodFormat(item.updateTime, 'unknown'),
            }),
          ),
        );
      return state.set('counts', counts).set('list', list);
    }
    case ACTIONS.PUSH_BREAD_CRUMB_INFO: {
      const { data = [], appId } = action;
      let path = '/';
      const breadCrumb = data.map((item: any) => {
        path += `${item.name}/`;
        return {
          ...item,
          link: `/group/application/detail/${appId}/files${path}`,
        };
      });

      return state
        .set('curBread', data[data.length - 1] || {})
        .set('breadCrumb', breadCrumb)
        .set('breadCrumbPath', path);
    }
    case ACTIONS.FETCH_BREAD_CRUMB_ERROR: {
      return state.merge({ list: undefined });
    }
    case ACTIONS.AFTER_REMOVE_RES: {
      const { removeIds = [] } = action;
      const list: any = state.get('list');
      return state.set(
        'list',
        list.filter((o: { id: any }) => !removeIds.includes(o.id)),
      );
    }
    case ACTIONS.OPEN_MOVE_MODAL: {
      return state
        .set('moveData', Map())
        .setIn(['moveData', 'ids'], List(action.ids))
        .setIn(['moveData', 'parentId'], action.parentId);
    }
    case ACTIONS.CLOSE_MOVE_MODAL: {
      return state.set('moveData', undefined).set('folderTree', undefined);
    }
    case ACTIONS.AFTER_MOVE_RES: {
      return state.setIn(['moveData', 'moving'], false);
    }
    case ACTIONS.UPDATE_MOVE_MODAL_DATA: {
      return state.setIn(['moveData', action.name], fromJS(action.value));
    }
    case ACTIONS.PUSH_FOLDER_TREE: {
      const rootNode = { id: '', name: 'Files', children: action.data || [] };
      return state.set('folderTree', fromJS(rootNode)).setIn(['moveData', 'requestIng'], false);
    }
    case ACTIONS.SET_SEARCH_TEXT: {
      return state.set('searchText', action.value);
    }
    case ACTIONS.CLEAR_LIST: {
      return state.set('counts', 0).set('list', undefined);
    }
    default:
      return state;
  }
};

export default reducer;
