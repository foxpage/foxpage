import { File } from '@foxpage/foxpage-server-types';

import { SetComponentFileStatus } from '../../../../src/controllers/components/set-component-file-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new SetComponentFileStatus();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  status: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    status: true,
  };
});

describe('Put: /components/status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(
      Object.assign({}, Data.component.fileList[0], {
        tags: [{ type: 'deprecated', status: true }],
      }) as File,
    );
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid file id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValue({ code: 1 });
    jest
      .spyOn(FileInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.component.fileList[0] as File);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response file can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'setFileDeleteStatus').mockResolvedValue({ code: 2 });
    jest
      .spyOn(FileInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.component.fileList[0] as File);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
