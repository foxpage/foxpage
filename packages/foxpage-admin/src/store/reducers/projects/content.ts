import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/content';
import { FileType } from '@/constants/index';
import { AuthorizeListItem, ContentEntity, File, ProjectEntity } from '@/types/index';

export type ProjectContentActionType = ActionType<typeof ACTIONS>;

export type BaseContent = { id: string; name: string };

const contents: ContentEntity[] = [];
const editContent: Partial<ContentEntity> & { oneLocale?: boolean } = {};
const baseContents: BaseContent[] = [];
const extendRecord: Record<string, string[]> = {};
const fileDetail: File = {} as File;
const locales: string[] = [];
const folder: ProjectEntity = {} as ProjectEntity;
const authList: AuthorizeListItem[] = [];

const initialState = {
  loading: false,
  saveLoading: false,
  editorDrawerOpen: false,
  contents,
  editContent,
  baseContents,
  extendRecord,
  fileDetail,
  locales,
  authListDrawerVisible: false,
  authListLoading: false,
  folder,
  authList,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ProjectContentActionType) =>
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

      case getType(ACTIONS.updateSaveLoading): {
        draft.saveLoading = action.payload.status;
        break;
      }

      case getType(ACTIONS.updateFileOnlineStatus): {
        const { online } = action.payload;
        draft.fileDetail = Object.assign({}, draft.fileDetail, { online });
        break;
      }

      case getType(ACTIONS.updateEditDrawerOpen): {
        const { open, editContent = {} as ContentEntity } = action.payload;
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

      case getType(ACTIONS.pushContentList): {
        const { data } = action.payload;
        draft.baseContents = data
          .filter((item) => item.isBase && item.version)
          .map((item) => ({
            id: item.id,
            name: item.title,
          }));
        // sort for group
        if (draft.fileDetail?.type === FileType.page) {
          const contentRecord: Record<string, ContentEntity[]> = {};
          const extendRecord: Record<string, string[]> = {};
          const list: ContentEntity[] = [];

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

      case getType(ACTIONS.pushParentFiles): {
        draft.folder = action.payload.folder;
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

      default: {
        return state;
      }
    }
  });
export default reducer;
