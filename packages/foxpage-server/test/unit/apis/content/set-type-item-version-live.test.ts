import { SetTypeItemLiveVersions } from '../../../../src/controllers/contents/set-type-item-version-live';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  id: '',
  versionNumber: 1,
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
    versionNumber: 1,
  };
});

const appInstance = new SetTypeItemLiveVersions();

describe('Put: /variables/live-versions /conditions/live-versions /functions/live-versions /mocks/live-versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValue({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1162001);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(false);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4162001);
  });

  it('response invalid contentId ', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162005);
  });

  it('response version not release status', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162001);
  });

  it('response invalid versionId', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162002);
  });

  it('response version relation not exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValue({ code: 3, data: '{"code":3}' });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162003);
  });

  it('response version relation depend recurse', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValue({ code: 3, data: '{"code":4}' });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162004);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3162001);
  });
});
