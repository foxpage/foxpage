import { GetUserItemAuthorizeDetail } from '../../../../src/controllers/authorizes/get-user-item-authorize';
import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  type: '',
  typeId: '',
};

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userInfo = {
    id: 'user_xxxx',
    account: 'mock_user',
  };

  params = {
    applicationId: Data.app.id,
    type: 'application',
    typeId: Data.app.id,
  };
});

const appInstance = new GetUserItemAuthorizeDetail();

describe('Get: /authorizes/item', () => {
  it('response app success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce(Data.auth.list);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180401);
  });

  it('response folder success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce([]);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as any);

    params.type = 'folder';
    params.typeId = Data.folder.id;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180401);
  });

  it('response file success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce([]);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.file.list[0] as any);

    params.type = 'file';
    params.typeId = Data.file.id;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180401);
  });

  it('response content success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce([]);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.file.list[0] as any);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as any);

    params.type = 'content';
    params.typeId = Data.content.id;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180401);
  });

  it('response invalid type', async () => {
    params.type = 'folder';
    params.typeId = '';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce(Data.auth.list);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2180401);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3180401);
  });
});
