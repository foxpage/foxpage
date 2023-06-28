import { AddContentLogs } from '../../../../src/controllers/contents/add-content-logs';
import { AppContentLogService } from '../../../../src/services/application-content-log-service';
import { ContentLogService } from '../../../../src/services/content-log-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  contentId: '',
  versionId: '',
  logs: [
    {
      content: [],
      action: '',
      structureId: '',
      createTime: 0,
    },
  ],
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
    logs: [
      {
        content: [],
        action: '11',
        structureId: 'xx',
        createTime: 0,
      },
    ] as never[],
  };
});

const appInstance = new AddContentLogs();

describe('Post: /contents/logs', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest.spyOn(ContentLogService.prototype, 'createLogQuery').mockResolvedValue({} as never);
    jest.spyOn(AppContentLogService.prototype, 'createLogQuery').mockResolvedValue({} as never);
    jest.spyOn(ContentLogService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161001);
  });

  it('response invalid app id', async () => {
    params.applicationId = null as any;
    params.contentId = null as any;
    params.versionId = null as any;

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2161001);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockRejectedValue(new Error('mock error'));
    jest.spyOn(ContentLogService.prototype, 'runTransaction').mockRejectedValue(new Error('mock error'));

    params.versionId = '';
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161001);
  });
});
