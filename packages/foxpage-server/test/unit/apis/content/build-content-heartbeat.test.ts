import { BuildContentHeartBeat } from '../../../../src/controllers/contents/build-content-heartbeat';
import { AuthService } from '../../../../src/services/authorization-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  contentId: '',
  versionId: '',
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
    contentId: Data.content.list[0].id,
    versionId: Data.version.list[0].id,
  };
});

const appInstance = new BuildContentHeartBeat();

describe('Put: /contents/heartbeat', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest.spyOn(VersionInfoService.prototype, 'updateDetail').mockResolvedValueOnce({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161401);
  });

  it('response invalid app id', async () => {
    params.applicationId = null as any;
    params.contentId = null as any;
    params.versionId = null as any;

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161401);
  });

  it('response no user operation', async () => {
    const versionDetail = Data.version.list[0] as any;
    versionDetail.operator = {
      operationTime: new Date().getTime(),
      userInfo: { id: ctx.userInfo?.id, account: '' },
    };
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail);
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValue(true);
    jest.spyOn(VersionInfoService.prototype, 'updateDetail').mockResolvedValueOnce({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161401);
  });

  it('response invalid version id', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161402);
  });

  it('response error', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161401);
  });
});
