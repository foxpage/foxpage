import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/detail';
import { PaginationInfo } from '@/types/common';
import { ProjectFileType } from '@/types/project';

export type ProjectFileActionType = ActionType<typeof ACTIONS>;

const fileList: ProjectFileType[] = [];
const editFile: ProjectFileType = {} as ProjectFileType;
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const initialState = {
  loading: false,
  saveLoading: false,
  drawerOpen: false,
  fileList,
  pageInfo,
  editFile,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: ProjectFileActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushFileList): {
        const { fileList, pageInfo } = action.payload;
        draft.fileList = fileList;
        draft.pageInfo = pageInfo;
        draft.loading = false;
        break;
      }

      case getType(ACTIONS.setLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.setSaveLoading): {
        const { loading } = action.payload;
        draft.saveLoading = loading;
        break;
      }

      case getType(ACTIONS.setAddFileDrawerOpenStatus): {
        const { editFile = {} as ProjectFileType, drawerOpen = false } = action.payload;
        draft.drawerOpen = drawerOpen;
        draft.editFile = editFile;
        break;
      }
      case getType(ACTIONS.updateEditFileValue): {
        const { name, value } = action.payload;
        const editFile = Object.assign({}, draft.editFile, { [name]: value });
        draft.editFile = editFile;
        break;
      }
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      default: {
        return state;
      }
    }
  });

export default reducer;
