import { File } from '@foxpage/foxpage-server-types';

import { SetFunctionFileStatus } from '../../../../src/controllers/functions/set-function-file-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new SetFunctionFileStatus();

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
});

describe('Put: /functions/status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>{});
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(403);
  });

  it('response invalid file id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 1 });
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(400);
  });

  it('response file can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValueOnce({ code: 2 });
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(500);
  });
});
