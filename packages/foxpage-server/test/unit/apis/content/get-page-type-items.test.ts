import { GetPageTypeItemList } from '../../../../src/controllers/contents/get-page-type-items';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  type: '',
  folderId: '',
  page: 1,
  size: 10,
  search: '',
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
    url: '/variable-searchs',
  };

  params = {
    applicationId: Data.app.id,
    type: 'live',
    folderId: '',
    page: 1,
    size: 10,
    search: '',
  };
});

const appInstance = new GetPageTypeItemList();

describe('Get: /variable-searchs /condition-searchs /function-searchs', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileListService.prototype, 'getItemFileContentDetail').mockResolvedValue({
      list: Data.file.list as any[],
      counts: 1,
    });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161701);
  });

  it('response success with folder id', async () => {
    params.folderId = Data.folder.id;
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as any);
    jest.spyOn(FileListService.prototype, 'getItemFileContentDetail').mockResolvedValue({
      list: Data.file.list as any[],
      counts: 1,
    });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161701);
  });

  it('response invalid folder id', async () => {
    params.folderId = Data.folder.id;
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);
    jest.spyOn(FileListService.prototype, 'getItemFileContentDetail').mockResolvedValue({
      list: Data.file.list as any[],
      counts: 1,
    });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161701);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161701);
  });
});
