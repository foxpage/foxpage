import _ from 'lodash';

import { SetMockPublishStatus } from '../../../../src/controllers/mocks/set-mock-version-publish';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetMockPublishStatus();

let params: any = {};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
    status: 'release',
  };
});

describe('Post: /mocks', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionLiveService.prototype, 'setVersionPublishStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1191001);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(4191001);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3191001);
  });
});
