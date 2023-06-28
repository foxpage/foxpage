import { UpdateTypeItemContentDetail } from '../../../../src/controllers/contents/update-type-item-contents';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  id: '',
  title: '',
  isBase: false,
  extendId: '',
  pageContentId: '',
  tags: [],
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
    url: '/variables/build-versions',
  };

  params = {
    applicationId: Data.app.id,
    id: '',
    title: 'test title',
    isBase: false,
    extendId: '',
    pageContentId: '',
    tags: [],
  };
});

const appInstance = new UpdateTypeItemContentDetail();

describe('Put: /variables/contents /conditions/contents /functions/contents', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValue({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1162201);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(false);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4162201);
  });

  it('response invalid id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162204);
  });

  it('response invalid contentId', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(21622201);
  });

  it('response invalid contentId 2', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162202);
  });

  it('response invalid type name exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValue({ code: 3 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162203);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3162201);
  });
});
