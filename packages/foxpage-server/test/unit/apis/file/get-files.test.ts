import { GetFileList } from '../../../../src/controllers/files/get-files';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { UserService } from '../../../../src/services/user-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetFileList();

let params = {
  applicationId: Data.app.id,
  ids: [] as string[],
};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    ids: [Data.file.id],
  };
});

describe('Post: /files', () => {
  it('response success', async () => {
    jest.spyOn(FileListService.prototype, 'getAppFileList').mockResolvedValueOnce(Data.file.list as any);
    jest.spyOn(StoreGoodsService.prototype, 'getAppFileStatus').mockResolvedValueOnce([]);
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValue([]);
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValue({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170301);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getAppFileList').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3170301);
  });
});
