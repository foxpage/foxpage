import { ContentVersion } from '@foxpage/foxpage-server-types';

import { UpdateConditionVersionDetail } from '../../../../src/controllers/conditions/update-condition-base-version';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new UpdateConditionVersionDetail();

let params: any = {};

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    contentId: Data.content.id,
    versionNumber: 10,
  };
});

describe('Get: /conditions/versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(<any>null);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 1 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response can not edit status', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 2 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response version exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 3 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest
      .spyOn(VersionInfoService.prototype, 'updateVersionDetail')
      .mockResolvedValueOnce({ code: 4, data: [] });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockRejectedValue(new Error('mock error'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
