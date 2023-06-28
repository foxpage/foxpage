import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { CatalogFileEntity, File, HistoryState, PageContent, PaginationInfo } from '@/types/index';

export type BuilderHeaderActionType = ActionType<typeof ACTIONS>;

const backState = {} as HistoryState | undefined;
const dsl: PageContent = {} as PageContent;
const fileDetail: File = {} as File;
const pageList: CatalogFileEntity[] = [];
const storeModalPageInfo: PaginationInfo = { page: 1, size: 8, total: 0 };
const storeModalTemplates: any[] = [];
const storeModalTemplatesBackup: any[] = [];

const initialState = {
  fileDetail,
  pageList,
  folderId: '',
  fileId: '',
  applicationId: '',
  contentId: '',
  versionId: '',
  fileType: '',
  loading: false,
  locale: undefined as string | undefined,
  project: '',
  zoom: 1,
  viewWidth: '',
  // store related
  storeModalTemplates,
  storeModalTemplatesBackup,
  storeModalPageInfo,
  storeLoading: false,
  storeModalType: '',
  storeModalVisible: false,
  // dsl related
  dslLoading: false,
  dsl,
  dslModalVisible: false,
  // html related
  htmlLoading: false,
  html: '',
  htmlModalVisible: false,
  // mock related
  mockLoading: false,
  mockModalVisible: false,
  mockId: '',
  // go back
  backState,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: BuilderHeaderActionType) =>
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

      case getType(ACTIONS.updateLocale): {
        draft.locale = action.payload.locale || '';
        break;
      }

      case getType(ACTIONS.updateEditorConfig): {
        draft.zoom = action.payload.params['zoom'];
        draft.viewWidth = action.payload.params['viewWidth'];
        break;
      }

      case getType(ACTIONS.pushCatalog): {
        const { data } = action.payload;
        const { files, name } = data || {};
        draft.pageList =
          (files &&
            files.map((item) => ({
              ...item,
              fold: true,
            }))) ||
          [];
        draft.project = name || '';
        break;
      }

      case getType(ACTIONS.updateFileFold): {
        const { id, fold } = action.payload;
        const pageList = state.pageList;
        const newPageList: CatalogFileEntity[] = _.cloneDeep(pageList);

        newPageList.forEach((item) => {
          if (item.id === id) {
            item.fold = fold;
          }
          if (item.contents && item.contents.length > 0) {
            item.contents.forEach((subItem) => {
              if (subItem.id === id) {
                subItem.fold = fold;
              }
            });
          }
        });

        draft.pageList = newPageList;
        break;
      }

      case getType(ACTIONS.updateContentInfo): {
        const { applicationId, folderId, fileId, contentId, versionId, fileType } = action.payload;

        const _applicationId = state.applicationId;
        const _contentId = state.contentId;
        const _fileId = state.fileId;
        const _fileType = state.fileType;
        const _folderId = state.folderId;
        const _versionId = state.versionId;

        draft.applicationId = applicationId || _applicationId;
        draft.contentId = contentId || _contentId;
        draft.fileId = fileId || _fileId;
        draft.fileType = fileType || _fileType;
        draft.folderId = folderId || _folderId;
        draft.versionId = versionId || _versionId;
        break;
      }

      // store related
      case getType(ACTIONS.updateStoreLoading): {
        draft.storeLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updateStoreModalVisible): {
        draft.storeModalType = action.payload.type || 'page';
        draft.storeModalVisible = action.payload.open;
        draft.storeModalTemplatesBackup = [];
        draft.storeModalTemplates = [];
        break;
      }

      case getType(ACTIONS.pushPageTemplate): {
        const { list, pageInfo } = action.payload;
        draft.storeModalTemplates = list;
        draft.storeModalPageInfo = pageInfo;

        break;
      }

      // dsl related
      case getType(ACTIONS.updateDSLLoading): {
        draft.dslLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updateDSLModalVisible): {
        draft.dslModalVisible = action.payload.open;
        break;
      }

      case getType(ACTIONS.pushDsl): {
        draft.dsl = action.payload.dsl;
        break;
      }

      // html related
      case getType(ACTIONS.updateHTMLLoading): {
        draft.htmlLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updateHTMLModalVisible): {
        draft.htmlModalVisible = action.payload.open;
        break;
      }

      case getType(ACTIONS.pushHtml): {
        draft.html = action.payload.html;
        break;
      }

      // mock related
      case getType(ACTIONS.updateMockLoading): {
        draft.mockLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updateMockModalVisible): {
        draft.mockModalVisible = action.payload.open;
        break;
      }

      case getType(ACTIONS.updateMockId): {
        draft.mockId = action.payload.id;
        break;
      }

      case getType(ACTIONS.updateBackState): {
        draft.backState = action.payload.state || undefined;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
