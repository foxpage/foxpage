import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/page';
import { clearAll } from '@/actions/builder/template';
import { FileType } from '@/types/application/file';
import { PageContentType } from '@/types/builder';

export type PageActionType = ActionType<typeof ACTIONS | typeof clearAll>;

interface StateType {
  fileDetail?: FileType;
  pageList: PageContentType[];
  folderId: string;
  fileId: string;
  applicationId: string;
  contentId: string;
  fileType: string;
  loading: boolean;
  locale: string;
}
const initialState = {
  pageList: [],
  folderId: '',
  fileId: '',
  applicationId: '',
  contentId: '',
  fileType: '',
  loading: false,
  locale: '',
};

const reducer = (state: StateType = initialState, action: PageActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushPageList): {
        const { data } = action.payload;
        draft.pageList = data;
        break;
      }

      case getType(ACTIONS.setContentId): {
        const { applicationId, folderId, fileId, contentId, fileType } = action.payload;

        const oldFolderId = state.folderId;
        const OldFileId = state.fileId;

        draft.applicationId = applicationId;
        draft.folderId = folderId || oldFolderId;
        draft.fileId = fileId || OldFileId;
        draft.contentId = contentId;
        draft.fileType = fileType;
        break;
      }

      case getType(ACTIONS.setLoadingStatus): {
        const { value } = action.payload;
        draft.loading = value;
        break;
      }

      case getType(ACTIONS.setLocale): {
        const { locale } = action.payload;
        draft.locale = locale;
        break;
      }

      case getType(ACTIONS.setFileFoldStatus): {
        const { id, fold } = action.payload;
        const pageList = state.pageList;
        const newPageList: PageContentType[] = _.cloneDeep(pageList);
        newPageList.forEach(item => {
          if (item.id === id) {
            item.fold = fold;
          }
          if (item.contents && item.contents.length > 0) {
            item.contents.forEach(subItem => {
              if (subItem.id === id) {
                subItem.fold = fold;
              }
            });
          }
        });
        draft.pageList = newPageList;
        break;
      }

      case getType(ACTIONS.pushFileDetail): {
        const { data } = action.payload;
        draft.fileDetail = data;
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
