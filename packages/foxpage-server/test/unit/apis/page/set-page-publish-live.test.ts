import _ from 'lodash';

import { ContentStatus } from '@foxpage/foxpage-server-types';

import { SetPageVersionPublishAndLiveStatus } from '../../../../src/controllers/pages/set-page-publish-live';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageVersionPublishAndLiveStatus();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  status: 'release' as ContentStatus,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/publish',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: 'release',
  };
});

describe('Put: /pages/publish', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionLiveService.prototype, 'setVersionPublishStatus')
      .mockResolvedValue({ code: 0, data: {} });
    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true });
    jest.spyOn(ContentLiveService.prototype, 'setLiveContent').mockResolvedValueOnce({} as never);
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051301);
  });

  it('response has publish', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValue({ code: 1 });
    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051301);
  });

  it('response invalid version data', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValue({ code: 0 });
    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: false });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051302);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051301);
  });
});
