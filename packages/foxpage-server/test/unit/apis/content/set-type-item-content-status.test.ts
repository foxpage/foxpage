import { SetTypeItemContentStatus } from '../../../../src/controllers/contents/set-type-item-content-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
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

const appInstance = new SetTypeItemContentStatus();

describe('Put: /variables/content-status /conditions/content-status /functions/content-status /mocks/content-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161901);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(false);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4161901);
  });

  it('response invalid contentId ', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161901);
  });

  it('response invalid contentId 2', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(
      Object.assign({}, Data.content.list[0], {
        applicationId: Data.app.id,
        type: 'variable',
        deleted: false,
      }),
    );
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161902);
  });

  it('response can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(
      Object.assign({}, Data.content.list[0], {
        applicationId: Data.app.id,
        type: 'variable',
        deleted: false,
      }),
    );
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161903);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161901);
  });
});
