import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { VariableTypes } from '@/constants/index';
import { FileScope, PaginationInfo, VariableEntity } from '@/types/index';

export type VariableActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const list: VariableEntity[] = [];
const editVariable: VariableEntity = {
  content: { schemas: [{ props: {}, type: VariableTypes[0] }], relation: {} },
} as VariableEntity;

const scope = 'application' as FileScope;

const initialState = {
  loading: false,
  pageInfo,
  list,
  editVariable,
  drawerType: '',
  drawerVisible: false,
  scope,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: VariableActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updatePaginationInfo): {
        draft.pageInfo = action.payload.pageInfo;
        break;
      }

      case getType(ACTIONS.pushList): {
        const { list = [], pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        draft.drawerType = action.payload?.type || '';
        draft.drawerVisible = action.payload.open;
        draft.editVariable = action.payload?.variable || editVariable;
        break;
      }
      case getType(ACTIONS.pushVariableBuilderVersion): {
        draft.editVariable = action.payload.data;
        break;
      }

      case getType(ACTIONS.updateEditVariableValue): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        draft.editVariable = Object.assign({}, editVariable, { [key]: value });
        break;
      }

      case getType(ACTIONS.updateVariableContentRelation): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        if (editVariable) {
          const newEditVariable = _.cloneDeep(editVariable);
          newEditVariable.content[key] = value;
          draft.editVariable = newEditVariable;
        }
        break;
      }

      case getType(ACTIONS.updateVariableContentValue): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        if (editVariable) {
          const newEditVariable = _.cloneDeep(editVariable);
          newEditVariable.content.schemas[0][key] = value;
          draft.editVariable = newEditVariable;
        }
        break;
      }

      case getType(ACTIONS.updateVariableContentProps): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        if (editVariable) {
          const newEditVariable = _.cloneDeep(editVariable);
          newEditVariable.content.schemas[0].props[key] = value;
          draft.editVariable = newEditVariable;
        }
        break;
      }

      case getType(ACTIONS.updateVariableRelations): {
        const { relations } = action.payload;
        const { functions = [] } = relations;
        const newEditVariable = _.cloneDeep(state.editVariable);
        if (!newEditVariable.relations) {
          newEditVariable.relations = { functions: [], variables: [] };
        }
        const { functions: oldFunctions = [] } = newEditVariable.relations;
        functions.forEach((func) => {
          if (!oldFunctions.find((item) => item.id === func.id)) {
            oldFunctions.push(func);
          }
        });

        newEditVariable.relations.functions = oldFunctions;
        draft.editVariable = newEditVariable;
        break;
      }

      case getType(ACTIONS.updateScope): {
        draft.scope = action.payload.scope;
        break;
      }
      // case getType(ACTIONS.setVariableBindModalVisibleStatus): {
      //   const { open, type, keys, mock } = action.payload;
      //   draft.variableBindParams = { open, type, keys, mock };
      //   break;
      // }

      default:
        return state;
    }
  });

export default reducer;
