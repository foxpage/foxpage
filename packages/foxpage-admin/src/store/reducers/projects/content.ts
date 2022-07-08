import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/content';
import { FileTypeEnum } from '@/constants/global';
import { FileType } from '@/types/application/file';
import { ProjectContentType } from '@/types/application/project';

export type ProjectContentActionType = ActionType<typeof ACTIONS>;

export type BaseContent = { id: string; name: string };

interface StateType {
  loading: boolean;
  saveLoading: boolean;
  editorDrawerOpen: boolean;
  editContent?: Partial<ProjectContentType>;
  contents: ProjectContentType[];
  locales: string[];
  fileDetail?: FileType;
  baseContents: BaseContent[];
  extendRecord: Record<string, string[]>;
}

const initialState = {
  loading: false,
  saveLoading: false,
  editorDrawerOpen: false,
  contents: [],
  extendRecord: {},
  locales: [],
  baseContents: [],
};

const reducer = (state: StateType = initialState, action: ProjectContentActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
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
          .map((item) => ({
            id: item.id,
            name: item.title,
          }));
        // sort for group
        if (draft.fileDetail?.type === FileTypeEnum.page) {
          const contentRecord: Record<string, ProjectContentType[]> = {};
          const extendRecord: StateType['extendRecord'] = {};
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
