import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import { AuthorizeListItem, ContentEntity, PaginationInfo, User } from '@/types/index';

export type ApplicationPageContentActionType = ActionType<typeof ACTIONS>;
type BaseContent = { id: string; name: string };

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const list: ContentEntity[] = [];
const baseContents: BaseContent[] = [];
const editContent: Partial<ContentEntity> & { oneLocale?: boolean } = {};
const locales: string[] = [];
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  loading: false,
  saveLoading: false,
  pageInfo,
  list,
  baseContents,
  locales,
  editContent,
  editDrawerOpen: false,
  authListDrawerVisible: false,
  authListLoading: false,
  authList,
  userList,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationPageContentActionType) =>
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

      case getType(ACTIONS.updateSaveLoading): {
        draft.saveLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.pushPageContentList): {
        const { list = [], pageInfo } = action.payload;
        draft.baseContents = list
          .filter((item) => item.isBase && item.version)
          .map((item) => ({ id: item.id, name: item.title }));
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        const { open, editContent = {} as ContentEntity } = action.payload;
        draft.editDrawerOpen = open;
        draft.editContent = editContent;
        break;
      }

      case getType(ACTIONS.updateEditContentValue): {
        const { key, value } = action.payload;
        const editContent = draft.editContent;
        draft.editContent = Object.assign({}, editContent, { [key]: value });
        break;
      }

      case getType(ACTIONS.updateEditContentTags): {
        const { key, value } = action.payload;
        const editContent = draft.editContent;
        const newEditContent: ContentEntity = (_.cloneDeep(editContent) || {}) as ContentEntity;
        const { tags = [] } = newEditContent;
        const tagIndex = tags.findIndex((item) => key in item);
        if (tagIndex > -1) {
          if (value) {
            tags[tagIndex][key] = value;
          } else {
            tags.splice(tagIndex, 1);
          }
        } else if (value) {
          tags.push({ [key]: value });
        }

        draft.editContent = newEditContent;
        break;
      }

      case getType(ACTIONS.updateAuthDrawerVisible): {
        const { visible = false, editContent = {} as ContentEntity } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editContent = editContent;
        break;
      }

      case getType(ACTIONS.updateAuthListLoading): {
        draft.authListLoading = action.payload.status;
        break;
      }

      case getType(ACTIONS.pushAuthList): {
        draft.authList = action.payload.list;
        break;
      }

      case getType(ACTIONS.pushUserList): {
        draft.userList = action.payload.list;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
