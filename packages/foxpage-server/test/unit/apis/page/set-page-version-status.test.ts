import _ from 'lodash';

import { SetPageVersionStatus } from '../../../../src/controllers/pages/set-page-version-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageVersionStatus();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  status: true,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/version-status',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
    status: true,
  };
});

describe('Put: /pages/version-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(RelationService.prototype, 'removeVersionRelations').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051601);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051601);
  });

  it('response invalid version', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051601);
  });

  it('response can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValueOnce({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051602);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051601);
  });
});
