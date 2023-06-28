import { SetContentVersionStatus } from '../../../../src/controllers/contents/set-version-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  id: '',
  status: '',
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

  params = {
    id: '',
    status: 'release',
  };
});

const appInstance = new SetContentVersionStatus();

describe('Put: /contents/version/status', () => {
  it('response success', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.status = 'base';
    versionDetail.deleted = false;

    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail as any);

    jest.spyOn(VersionInfoService.prototype, 'updateVersionItem').mockResolvedValue({} as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1160901);
  });

  it('response invalid contentId', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2160901);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4160901);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3160901);
  });
});
