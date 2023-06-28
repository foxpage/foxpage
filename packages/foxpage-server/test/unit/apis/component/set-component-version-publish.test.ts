import { ContentStatus } from '@foxpage/foxpage-server-types';

import { SetComponentVersionPublishStatus } from '../../../../src/controllers/components/set-component-version-publish';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new SetComponentVersionPublishStatus();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.version.id,
  status: <ContentStatus>'release',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
    status: <ContentStatus>'release',
  };
});

describe('Put: /components/version-publish', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue(<any>Data.version.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response version had published', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValue({ code: 1 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionLiveService.prototype, 'setVersionPublishStatus')
      .mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
