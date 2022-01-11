import { ContentStatus, ContentVersion } from '@foxpage/foxpage-server-types';

import { SetFunctionPublishStatus } from '../../../../src/controllers/functions/set-function-version-publish';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new SetFunctionPublishStatus();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  status: <ContentStatus>'release',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: <ContentStatus>'release',
  };
});

describe('Put: /functions/version-publish', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<ContentVersion>{});
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValueOnce({ code: 1 });
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionLiveService.prototype, 'setVersionPublishStatus')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
