import { AddAuthorizeDetail } from '../../../../src/controllers/authorizes/add-authorize';
import { AuthService } from '../../../../src/services/authorization-service';
import { DBQuery, FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  type: '',
  typeId: '',
  targetIds: [] as string[],
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
    type: 'file',
    typeId: 'file_YR8BqYp8aajzw8A',
    targetIds: ['user_jxTACUjswDfgmXo'] as string[],
    mask: 1,
    allow: true,
  };
});

const appInstance = new AddAuthorizeDetail();

describe('Post: /authorizes', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(true);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce([]);
    jest.spyOn(AuthService.prototype, 'getTargetRelation').mockResolvedValueOnce({});
    jest.spyOn(AuthService.prototype, 'addDetailQuery').mockReturnValue({} as DBQuery);
    jest.spyOn(AuthService.prototype, 'batchUpdateDetailQuery').mockResolvedValueOnce({});
    jest.spyOn(AuthService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180101);
  });

  it('response success 2', async () => {
    params.mask = null as any;
    params.allow = null as any;
    (ctx.userInfo as any).id = null as any;
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(true);
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce(Data.auth.list);
    jest.spyOn(AuthService.prototype, 'getTargetRelation').mockResolvedValueOnce({});
    jest.spyOn(AuthService.prototype, 'addDetailQuery').mockReturnValue({} as DBQuery);
    jest.spyOn(AuthService.prototype, 'batchUpdateDetailQuery').mockResolvedValueOnce({});
    jest.spyOn(AuthService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1180101);
  });

  it('response invalid type id', async () => {
    params.typeId = '';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2180101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4180101);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'checkTypeIdAuthorize').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3180101);
  });
});
