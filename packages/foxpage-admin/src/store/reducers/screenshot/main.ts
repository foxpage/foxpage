import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/screenshot/index';
import { ScreenshotPicture } from '@/types/index';

export type ScreenshotActionType = ActionType<typeof ACTIONS>;

const screenshots: Record<string, ScreenshotPicture[]> = {};

const initialState = {
  loading: false,
  screenshots,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ScreenshotActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.status;
        break;
      }

      case getType(ACTIONS.pushScreenshots): {
        draft.screenshots = action.payload.result;
        break;
      }

      default: {
        return state;
      }
    }
  });

export default reducer;
