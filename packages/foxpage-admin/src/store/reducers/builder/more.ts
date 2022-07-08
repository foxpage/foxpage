import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/more';
import { clearAll } from '@/actions/builder/template';
import { DslType, MockContent } from '@/types/builder';

export type MoreActionType = ActionType<typeof ACTIONS | typeof clearAll>;

const dsl: DslType = {} as DslType;
const mock: MockContent = {
  relation: {},
  schemas: [],
  enable: false,
} as MockContent;
const initialState = {
  loading: false,
  dsl,
  dslModalOpen: false,
  mockLoading: false,
  mock,
  mockModeEnable: false,
  mockId: '',
  mockModalVisible: false,
};

const reducer = (state = initialState, action: MoreActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateDslModalOpen): {
        const { open } = action.payload;
        draft.dslModalOpen = open;
        break;
      }
      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }
      case getType(ACTIONS.pushDsl): {
        const { dsl } = action.payload;
        draft.dsl = dsl;
        break;
      }

      case getType(ACTIONS.updateMockModalVisible): {
        draft.mockModalVisible = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateMockLoading): {
        draft.mockLoading = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateMockMode): {
        draft.mockModeEnable = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateMockId): {
        draft.mockId = action.payload.id;
        break;
      }
      case getType(ACTIONS.pushMock): {
        draft.mock = action.payload.mock;
        break;
      }

      default:
        return state;
    }
  });

export default reducer;
