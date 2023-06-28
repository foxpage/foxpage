import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { SetPageFileStatus } from '../../../../src/controllers/pages/set-page-file-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileCheckService } from '../../../../src/services/file-services/file-check-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { RelationService } from '../../../../src/services/relation-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageFileStatus();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  status: true,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/status',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

describe('Put: /pages/status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileCheckService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(RelationService.prototype, 'removeVersionRelations').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4151201);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051201);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue({} as File);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051201);
  });

  it('response has live version content', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest
      .spyOn(FileCheckService.prototype, 'checkFileHasLiveContent')
      .mockResolvedValueOnce([Data.content.id]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051202);
  });

  it('response invalid content id 2', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051203);
  });

  it('response can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051204);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051201);
  });
});
