import { UpdateTypeItemVersionDetail } from '../../../../src/controllers/contents/update-type-item-versions';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  id: '',
  content: {} as any,
  version: '',
  pageContentId: '',
  contentUpdateTime: '',
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
    url: '/variables/versions',
  };

  params = {
    applicationId: Data.app.id,
    id: '',
    content: {} as any,
    version: '0.0.2',
    pageContentId: '',
    contentUpdateTime: '',
  };
});

const appInstance = new UpdateTypeItemVersionDetail();

describe('Put: /variables/versions /conditions/versions /functions/versions /mocks/versions', () => {
  it('response success', async () => {
    ctx.request.url = '/mocks/versions';
    params.content.schemas = [];
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Object.assign({}, Data.content.list[0] as any, { type: 'mock' }));
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 0 });
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue(Data.version.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1162301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(false);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4162301);
  });

  it('response invalid id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162304);
  });

  it('response invalid versionId', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162301);
  });

  it('response unEdit status', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162302);
  });

  it('response invalid type name exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 3 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162303);
  });

  it('response missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 4 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162305);
  });

  it('response invalid relation', async () => {
    ctx.request.url = '/conditions/versions';
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValue(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Object.assign({}, Data.content.list[0] as any, { type: 'condition' }));
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 5 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2162306);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3162301);
  });
});
