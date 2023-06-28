import { GetPageBuildVersionDetail } from '../../../../src/controllers/pages/get-page-build-versions';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageBuildVersionDetail();

let params = {
  applicationId: Data.app.id,
  id: '',
};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: 'pages/build-versions',
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
  };
});

describe('Post: /pages/build-versions', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest
      .spyOn(VersionInfoService.prototype, 'getTemplateDetailFromPage')
      .mockResolvedValueOnce(Data.version.list[1] as any);

    jest
      .spyOn(VersionInfoService.prototype, 'getPageVersionInfo')
      .mockResolvedValue(Data.version.pageVersionInfo as any);

    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050401);
  });

  it('response success with template', async () => {
    ctx.request.url = 'templates/lives';
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest
      .spyOn(VersionInfoService.prototype, 'getPageVersionInfo')
      .mockResolvedValue(Data.version.pageVersionInfo as any);

    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050401);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxContentVersionDetail')
      .mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3050401);
  });
});
