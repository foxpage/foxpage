import _ from 'lodash';

import { SetTypeItemVersionStatus } from '../../../../src/controllers/contents/set-type-item-version-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  id: '',
  status: true,
};

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: 'user_xxxx',
    account: 'mock_user',
  };
  ctx.request = {
    url: '/variables/content-status',
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

const appInstance = new SetTypeItemVersionStatus();

describe('Put: /variables/version-status /conditions/version-status /functions/version-status /mocks/version-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(_.cloneDeep(Data.version.list[0]) as any);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(_.cloneDeep(Data.content.list[0]));
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1162101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(false);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(_.cloneDeep(Data.version.list[0]) as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4162101);
  });

  it('response invalid versionId', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162103);
  });

  it('response invalid versionId 2', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(_.cloneDeep(Data.version.list[0]) as any);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162104);
  });

  it('response invalid versionId 3', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(_.cloneDeep(Data.version.list[0]) as any);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Object.assign({}, Data.content.list[0], { deleted: false }));
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162101);
  });

  it('response version can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(_.cloneDeep(Data.version.list[0]) as any);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Object.assign({}, Data.content.list[0], { deleted: false }));
    jest.spyOn(VersionInfoService.prototype, 'setVersionDeleteStatus').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162102);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3162101);
  });
});
