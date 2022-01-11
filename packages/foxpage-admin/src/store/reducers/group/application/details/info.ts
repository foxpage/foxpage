import { Map } from 'immutable';

import { rootFolderType } from '../../../../../pages/common/constant/FileType';
import * as ACTIONS from '../../../../actions/group/application/details/info';

const initialState = Map();

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ACTIONS.FETCH_APPLICATION_INFO_SUCCESS: {
      const newState = state;
      const { data = {} } = action;
      const { folders = [] } = data;
      const rootFolder: any = {};
      Object.entries(rootFolderType).forEach(([key, value]) => {
        const folder = folders.find((item: { tags: Array<{ type: string }> }) => item.tags[0].type === value);
        if (folder) {
          rootFolder[key] = folder;
        }
      });
      return newState.set('info', data).set('loading', false).set('rootFolder', rootFolder);
    }
    case ACTIONS.SET_LOADING: {
      const { value } = action;
      return state.set('loading', value);
    }

    default:
      return state;
  }
};

export default reducer;
