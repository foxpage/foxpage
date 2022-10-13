import { File } from '@foxpage/foxpage-server-types';

import { UpdateConditionDetail } from '../../../../src/controllers/conditions/update-condition-files';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new UpdateConditionDetail();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  name: '',
  tags: [],
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    name: 'demo name',
    tags: [],
  };
});

describe('Put: /conditions/files', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>{});

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid file id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 1 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response file name exist', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 2 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid name', async () => {
    params.name = '!@#$%test';

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockRejectedValue(new Error('mock error'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
