import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/components';
import { Component, Content } from '@/types/index';

export type ComponentsActionType = ActionType<typeof ACTIONS>;

const components: Component[] = [];
const versions: Component[] = [];
const nameVersionDetails: Component[] = [];
const initialState = {
  components,
  blockDSLMap: {} as Record<string, Content>,
  blocks: [] as Content[],
  versions,
  nameVersionDetails,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ComponentsActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.pushComponentList): {
        draft.components = action.payload.data;
        break;
      }

      case getType(ACTIONS.pushBlockDSL): {
        draft.blockDSLMap = action.payload.data;
        draft.blocks = Object.values(draft.blockDSLMap).filter((item) => !!item.id);
        break;
      }

      case getType(ACTIONS.pushComponentVersions): {
        draft.versions = action.payload.list;
        break;
      }

      case getType(ACTIONS.pushComponentVersionDetails): {
        const list = action.payload.list || [];
        draft.nameVersionDetails = list.map((item) => item.package);
        break;
      }

      default:
        break;
    }
  });

export default reducer;
