import { GetContentVersionChangeLogs } from '../../../../src/controllers/contents/get-version-logs';
import { ContentLogService } from '../../../../src/services/content-log-service';
// import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { LogService } from '../../../../src/services/log-service';
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
    applicationId: Data.content.list[0].applicationId,
    contentId: Data.content.list[0].id,
    versionId: Data.version.list[0].id,
  };
});

const appInstance = new GetContentVersionChangeLogs();

describe('Get: /contents/version-logs', () => {
  it('response success', async () => {
    const versionDetail = Data.version.list[0] as any;
    versionDetail.contentId = Data.content.list[0].id;

    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail);

    jest.spyOn(ContentLogService.prototype, 'find').mockResolvedValueOnce(Data.log.list as any);
    jest.spyOn(LogService.prototype, 'find').mockResolvedValueOnce(Data.log.list as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1052501);
  });

  it('response invalid version Id', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2052501);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3052501);
  });
});
