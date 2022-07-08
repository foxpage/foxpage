import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/group/application/settings';
import { Application } from '@/types/application';

export type SettingsActionType = ActionType<typeof ACTIONS>;

const application: Application = {} as Application;
const locales: string[] = [];
const defaultState = {
  application,
  loading: false,
  locales,
};

export type StateType = typeof defaultState;

const reducer = (state: StateType = defaultState, action: SettingsActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.pushApplicationInfo): {
        const { application } = action.payload;
        // handle app host single/multiple
        const newApplication = _.cloneDeep(application);
        newApplication.host =
          newApplication?.host?.length > 0
            ? newApplication.host.map((item) => ({
                url: typeof item === 'string' ? item : item.url,
                locales: typeof item === 'string' ? [] : item.locales,
              }))
            : [];
        draft.application = newApplication;
        break;
      }

      case getType(ACTIONS.pushAllLocales): {
        const { locales } = action.payload;
        draft.locales = locales;
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
