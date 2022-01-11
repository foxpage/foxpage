import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import { clearAll } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/variable';
import { EditorInputEnum } from '@/constants/variable';
import { VariableTypes } from '@/pages/common/constant/VariableFile';
import VariableType from '@/types/application/variable';
import { VariableBindParams } from '@/types/builder/editor';
import { PaginationInfo } from '@/types/index';

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const variables: VariableType[] = [];
const variable: VariableType = {
  content: { schemas: [{ props: {}, type: VariableTypes[0] }], relation: {} },
} as VariableType;

const variableBindParams: VariableBindParams = {
  open: false,
  keys: '',
  type: EditorInputEnum.Text,
};
const initialState = {
  pageInfo,
  variables,
  editVariable: variable,
  editorDrawerOpen: false,
  loading: false,
  variableBindParams,
};

export type VariableActionType = ActionType<typeof ACTIONS | typeof clearAll>;

type StateType = typeof initialState;

const reducer = (state: StateType = initialState, action: VariableActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.pushVariables): {
        const { data, pageInfo } = action.payload;
        draft.pageInfo = pageInfo;
        draft.variables = data;
        break;
      }

      case getType(ACTIONS.updateVariableEditDrawerOpen): {
        const { open } = action.payload;

        draft.editorDrawerOpen = open;
        draft.editVariable = variable;
        break;
      }
      case getType(ACTIONS.pushVariableBuilderVersion): {
        const { data } = action.payload;
        draft.editVariable = data;
        break;
      }

      case getType(ACTIONS.updateEditVariableValue): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        const newEditVariable = Object.assign({}, editVariable, { [key]: value });
        draft.editVariable = newEditVariable;
        break;
      }

      case getType(ACTIONS.updateVariableContentRelation): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        if (editVariable) {
          const newEditVariable = _.cloneDeep(editVariable) as VariableType;
          newEditVariable.content[key] = value;
          draft.editVariable = newEditVariable;
        }
        break;
      }

      case getType(ACTIONS.updateVariableContentValue): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        if (editVariable) {
          const newEditVariable = _.cloneDeep(editVariable) as VariableType;
          newEditVariable.content.schemas[0][key] = value;
          draft.editVariable = newEditVariable;
        }
        break;
      }

      case getType(ACTIONS.updateVariableContentProps): {
        const { key, value } = action.payload;
        const editVariable = state.editVariable;
        if (editVariable) {
          const newEditVariable = _.cloneDeep(editVariable) as VariableType;
          newEditVariable.content.schemas[0].props[key] = value;
          draft.editVariable = newEditVariable;
        }
        break;
      }

      case getType(ACTIONS.setLoadingStatus): {
        const { loading } = action.payload;
        draft.loading = loading;
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
        functions.forEach(func => {
          if (!oldFunctions.find(item => item.id === func.id)) {
            oldFunctions.push(func);
          }
        });

        newEditVariable.relations.functions = oldFunctions;
        draft.editVariable = newEditVariable;
        break;
      }

      case getType(ACTIONS.setVariableBindModalVisibleStatus): {
        const { open, type, keys } = action.payload;
        draft.variableBindParams = { open, type, keys };
        break;
      }

      case getType(clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        return state;
    }
  });

export default reducer;
