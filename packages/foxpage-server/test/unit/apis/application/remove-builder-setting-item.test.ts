import { RemoveApplicationSettingDetail } from '../../../../src/controllers/applications/remove-builder-setting-item';
import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: Data.app.id,
  type: '',
  ids: '',
};

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    type: 'component',
    ids: '1',
  };
});

const appInstance = new RemoveApplicationSettingDetail();

describe('Delete: /applications/builder-setting', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1031301);
  });

  it('response success 2', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1031301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4031301);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3031301);
  });
});
