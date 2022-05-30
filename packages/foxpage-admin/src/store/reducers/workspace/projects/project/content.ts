import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/content';
import { FileTypeEnum } from '@/constants/global';
import { ProjectContentType } from '@/types/application/project';
import { AuthorizeListItem, FileType, User } from '@/types/index';

export type ProjectContentActionType = ActionType<typeof ACTIONS>;

export type BaseContent = { id: string; name: string };

const fileDetail: FileType = {} as FileType;
const contents: ProjectContentType[] = [];
const editContent: Partial<ProjectContentType> = {};
const baseContents: BaseContent[] = [];
const extendRecord: Record<string, string[]> = {};
const locales: string[] = [];
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  loading: false,
  saveLoading: false,
  editorDrawerOpen: false,
  fileDetail,
  contents,
  editContent,
  extendRecord,
  locales,
  baseContents,
  authListDrawerVisible: false,
  authListLoading: false,
  authList,
  userList,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: ProjectContentActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      case getType(ACTIONS.updateEditDrawerOpen): {
        const { open, editContent = {} as ProjectContentType } = action.payload;
        draft.editorDrawerOpen = open;
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
        const newEditContent: ProjectContentType = (_.cloneDeep(editContent) || {}) as ProjectContentType;
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
      case getType(ACTIONS.pushContentList): {
        const { data } = action.payload;
        draft.baseContents = data
          .filter((item) => item.isBase && item.version)
          .map((item) => ({ id: item.id, name: item.title }));
        // sort for group
        if (draft.fileDetail?.type === FileTypeEnum.page) {
          const contentRecord: Record<string, ProjectContentType[]> = {};
          const extendRecord: Record<string, string[]> = {};
          const list: ProjectContentType[] = [];

          data.forEach((item) => {
            if (item.isBase || !item.extendId) {
              list.push(item);
            } else {
              if (!contentRecord[item.extendId]) {
                contentRecord[item.extendId] = [];
              }
              contentRecord[item.extendId].push(item);
              if (!extendRecord[item.extendId]) {
                extendRecord[item.extendId] = [];
              }
              extendRecord[item.extendId].push(item.id);
            }
          });

          Object.keys(contentRecord).forEach((key) => {
            const children = contentRecord[key];
            if (children && children.length > 0) {
              const idx = list.findIndex((item) => item.id === key);
              list.splice(idx + 1, 0, ...children);
            }
          });

          draft.extendRecord = extendRecord;
          draft.contents = list;
        } else {
          draft.contents = data;
        }

        break;
      }
      case getType(ACTIONS.updateFetchLoading): {
        const { value } = action.payload;
        draft.loading = value;
        break;
      }
      case getType(ACTIONS.setSaveLoading): {
        const { loading } = action.payload;
        draft.saveLoading = loading;
        break;
      }
      case getType(ACTIONS.pushLocales): {
        const { locales } = action.payload;
        draft.locales = locales;
        break;
      }
      case getType(ACTIONS.pushFileDetail): {
        const { data } = action.payload;
        draft.fileDetail = data;
        break;
      }
      case getType(ACTIONS.updateFileOnlineStatus): {
        const { online } = action.payload;
        draft.fileDetail = Object.assign({}, draft.fileDetail, { online });
        break;
      }
      case getType(ACTIONS.pushAuthList): {
        draft.authList = action.payload.list;
        break;
      }
      case getType(ACTIONS.updateAuthListLoading): {
        draft.authListLoading = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateAuthDrawerVisible): {
        const { visible = false, editContent = {} as ProjectContentType } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editContent = editContent;
        break;
      }
      case getType(ACTIONS.pushUserList): {
        draft.userList = action.payload.list;
        break;
      }
      default: {
        return state;
      }
    }
  });
export default reducer;
