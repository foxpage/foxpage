import _ from 'lodash';

import { SetFileStatus } from '../../../../src/controllers/files/set-file-status';
// import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
// import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileCheckService } from '../../../../src/services/file-services/file-check-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
// import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetFileStatus();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id,
    account: Data.user.account,
  };
  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
  };
});

describe('Put: /file/delete', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as any);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);
    jest.spyOn(FileInfoService.prototype, 'updateDetail').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170501);
  });

  it('response success with status', async () => {
    params.status = false;
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as any);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);
    jest.spyOn(FileInfoService.prototype, 'updateDetail').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170501);
  });

  it('response not auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4170501);
  });

  it('response invalid fileId', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170501);
  });

  it('response invalid fileId', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as any);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([Data.file.id]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170502);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3170501);
  });
});
