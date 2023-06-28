import { GetAppTypeItemScopeInfoList } from '../../../../src/controllers/contents/get-type-item-scope-infos';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  id: '',
  search: '',
  names: [],
  page: 1,
  size: 10,
};

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: 'user_xxxx',
    account: 'mock_user',
  };
  ctx.request = {
    url: '/variables/build-versions',
  };

  params = {
    applicationId: Data.app.id,
    id: '',
    search: '',
    names: [],
    page: 1,
    size: 10,
  };
});

const appInstance = new GetAppTypeItemScopeInfoList();

describe('Get: /variables/scope-infos /conditions/scope-infos', () => {
  params.search = 'search';
  it('response success', async () => {
    params.search = 'mock search';
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(Data.file.list as any[]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest
      .spyOn(VersionNumberService.prototype, 'getContentMaxVersionByIds')
      .mockResolvedValue([{ _id: '', versionNumber: 1 }]);
    jest
      .spyOn(VersionListService.prototype, 'getContentByIdAndVersionNumber')
      .mockResolvedValue(Data.version.list as any[]);
    jest.spyOn(ContentListService.prototype, 'getContentLiveInfoByIds').mockResolvedValue([]);
    jest.spyOn(RelationService.prototype, 'formatRelationResponse').mockResolvedValue({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161801);
  });

  it('response success with names', async () => {
    params.names = ['mock name'] as unknown as never[];
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(Data.file.list as any[]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest
      .spyOn(VersionNumberService.prototype, 'getContentMaxVersionByIds')
      .mockResolvedValue([{ _id: '', versionNumber: 1 }]);
    jest
      .spyOn(VersionListService.prototype, 'getContentByIdAndVersionNumber')
      .mockResolvedValue(Data.version.list as any[]);
    jest.spyOn(ContentListService.prototype, 'getContentLiveInfoByIds').mockResolvedValue([]);
    jest.spyOn(RelationService.prototype, 'formatRelationResponse').mockResolvedValue({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161801);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161801);
  });
});
