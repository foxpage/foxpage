import { ContentVersion } from '@foxpage/foxpage-server-types';

import { UpdateVariableVersionDetail } from '../../../../src/controllers/variables/update-variable-versions';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new UpdateVariableVersionDetail();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  content: { id: Data.file.id, schemas: [], relation: {} },
  version: '0.0.2',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    content: { id: Data.file.id, schemas: [], relation: {} },
    version: '0.0.2',
  };
});

describe('Put: /variables/versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<ContentVersion>{});

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 1 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response version can not be edit', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 2 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response version exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 3 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response version missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'updateVersionDetail')
      .mockResolvedValueOnce({ code: 4, data: [] });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'updateVersionDetail')
      .mockRejectedValue(new Error('mock error'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
