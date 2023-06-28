import { UnlockBuildContent } from '../../../../src/controllers/contents/unlock-build-content';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  versionId: '',
  contentId: '',
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
    applicationId: Data.file.list[0].applicationId,
    versionId: Data.version.list[0].id,
    contentId: Data.content.list[0].id,
  };
});

const appInstance = new UnlockBuildContent();

describe('Put: /contents/version/template', () => {
  it('response success', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.status = 'base';
    versionDetail.deleted = false;

    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail as any);
    jest.spyOn(VersionInfoService.prototype, 'updateDetail').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161301);
  });

  it('response invalid id', async () => {
    params.applicationId = null as any;
    params.contentId = null as any;
    params.versionId = null as any;

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161301);
  });

  it('response invalid version id', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161302);
  });

  it('response error', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161301);
  });
});
