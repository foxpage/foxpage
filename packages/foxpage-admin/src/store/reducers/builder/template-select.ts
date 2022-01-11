import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import { clearAll } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/global';
import { Template } from '@/types/builder';
import { PaginationInfo } from '@/types/common';
import { StoreProjectResource } from '@/types/store';

export type TemplateSelectActionType = ActionType<typeof ACTIONS | typeof clearAll>;

const templates: Template[] = [];
const storeResourceList: StoreProjectResource[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 8, total: 0 };
const initialState = {
  templates,
  storeResourceList,
  pageInfo,
  loading: false,
  pageTemplateSelectModalOpen: false,
  componentTemplateSelectModalOpen: false,
  pageCopyModalOpen: false,
};

const reducer = (state = initialState, action: TemplateSelectActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushTemplates): {
        const { templates } = action.payload;
        draft.templates = templates;
        break;
      }

      case getType(ACTIONS.pushStoreProjectGoods): {
        const { resourceList, pageInfo } = action.payload;
        const newResourceList = resourceList.map(resource => {
          const files = resource.files.filter(
            file => file.type === FileTypeEnum.page || file.type === FileTypeEnum.template,
          );
          return {
            ...resource,
            files,
          };
        });
        draft.storeResourceList = newResourceList;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.updateTemplateFetchLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.updatePageTemplateSelectModalOpen): {
        const { value = true } = action.payload;
        draft.storeResourceList = [];
        draft.templates = [];
        draft.pageTemplateSelectModalOpen = value;
        break;
      }

      case getType(ACTIONS.updateComponentTemplateSelectModalOpen): {
        const { value = true } = action.payload;
        draft.componentTemplateSelectModalOpen = value;
        break;
      }

      case getType(ACTIONS.updatePageCopyModalOpen): {
        const { value = true } = action.payload;
        draft.storeResourceList = [];
        draft.templates = [];
        draft.pageCopyModalOpen = value;
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
