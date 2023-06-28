import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/settings/application';
import { Application } from '@/types/index';

export type ApplicationSettingsActionType = ActionType<typeof ACTIONS>;

const application: Application = {} as Application;
const locales: string[] = [];

const initialState = {
  application,
  applicationId: '',
  loading: false,
  locales,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationSettingsActionType) =>
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

      case getType(ACTIONS.updateApplicationId): {
        draft.applicationId = action.payload.id;
        break;
      }

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

      default:
        break;
    }
  });

export default reducer;
