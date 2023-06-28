import { SetAuthorizeStatus } from '../../../../src/controllers/authorizes/set-authorize-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  ids: [] as string[],
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
    applicationId: Data.app.id,
    ids: [Data.auth.list[0].id],
  };
});

const appInstance = new SetAuthorizeStatus();

describe('Put: /authorizes/status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockResolvedValueOnce([Data.auth.list[0]]);
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(true);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180301);
  });

  it('response invalid auth ids', async () => {
    params.ids = [];

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2180301);
  });
  it('response update one type', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.auth.list);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2180302);
  });

  it('response not auth', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockResolvedValueOnce([Data.auth.list[0]]);
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4180301);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3180301);
  });
});
