import { ContentVersion } from '@foxpage/foxpage-server-types';

import { SetVariableVersionStatus } from '../../../../src/controllers/variables/set-variable-version-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new SetVariableVersionStatus();

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
});

describe('Put: /variables/version-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<ContentVersion>{});
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(403);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 1 });
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(400);
  });

  it('response version can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 2 });
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(500);
  });
});
