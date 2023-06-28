import { GetPageContentLogs } from '../../../../src/controllers/contents/get-page-content-logs';
import { ContentLogService } from '../../../../src/services/content-log-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  contentId: '',
  versionId: '',
  structureId: '',
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
    structureId: 'stru_xxxx',
  };
});

const appInstance = new GetPageContentLogs();

describe('Get: /contents/logs', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest.spyOn(ContentLogService.prototype, 'find').mockResolvedValue(Data.log.list as any);
    jest.spyOn(ContentLogService.prototype, 'getCount').mockResolvedValue(1);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1162801);
  });

  it('response invalid app or contentId', async () => {
    params.applicationId = null as any;
    params.contentId = null as any;
    params.structureId = null as any;

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2162801);
  });

  it('response success with invalid versionId', async () => {
    params.versionId = null as any;

    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest.spyOn(ContentLogService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(ContentLogService.prototype, 'getCount').mockResolvedValue(1);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1162801);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockRejectedValue(new Error('mock error'));
    jest.spyOn(ContentLogService.prototype, 'find').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3162801);
  });
});
