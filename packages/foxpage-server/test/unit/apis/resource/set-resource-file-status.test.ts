import { File } from '@foxpage/foxpage-server-types';

import { SetResourceFileStatus } from '../../../../src/controllers/resources/set-resource-file-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new SetResourceFileStatus();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  status: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

describe('put: /resources/file-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid file id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValue({ code: 1 });

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValue({ code: 2 });

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
