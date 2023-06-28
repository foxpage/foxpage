import _ from 'lodash';

import { ContentStatus, ContentVersion } from '@foxpage/foxpage-server-types';

import { SetPageVersionPublishStatus } from '../../../../src/controllers/pages/set-page-version-publish';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageVersionPublishStatus();
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
    url: '/pages/version-publish',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
    status: 'release',
  };
});

describe('Put: /pages/version-publish', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true });
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(VersionLiveService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as ContentVersion);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051501);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051501);
  });

  it('response invalid version', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: false });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051502);
  });

  it('response version has published', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true });
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValueOnce({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051501);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051501);
  });
});
