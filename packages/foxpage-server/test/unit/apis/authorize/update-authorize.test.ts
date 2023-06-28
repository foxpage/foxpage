import { UpdateAuthorizeDetail } from '../../../../src/controllers/authorizes/update-authorize';
import { AuthService } from '../../../../src/services/authorization-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  // applicationId: '',
  ids: [] as string[],
  mask: 1,
  allow: true,
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
    ids: [Data.auth.list[0].id],
    mask: 1,
    allow: true,
  };
});

const appInstance = new UpdateAuthorizeDetail();

describe('Put: /authorizes', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockResolvedValueOnce([Data.auth.list[0]]);
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(true);
    jest.spyOn(AuthService.prototype, 'batchUpdateDetail').mockResolvedValueOnce(true);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180201);
  });

  it('response invalid auth ids', async () => {
    params.ids = [];

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2180201);
  });
  it('response update one type', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.auth.list);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2180202);
  });

  it('response not auth', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockResolvedValueOnce([Data.auth.list[0]]);
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4180201);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'getDetailByIds').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3180201);
  });
});
