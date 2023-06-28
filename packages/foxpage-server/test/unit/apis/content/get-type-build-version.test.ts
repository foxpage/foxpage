import { GetTypeItemBuildDetail } from '../../../../src/controllers/contents/get-type-build-version';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import { VersionRelationService } from '../../../../src/services/version-services/version-relation-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  id: '',
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
  };
});

const appInstance = new GetTypeItemBuildDetail();

describe('Get: /variables/build-versions /conditions/build-versions /functions/build-versions', () => {
  it('response success', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    jest.spyOn(VersionNumberService.prototype, 'getLatestVersionNumber').mockResolvedValue(1);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValue(Data.version.list[0] as any);

    jest
      .spyOn(VersionRelationService.prototype, 'getVersionRelations')
      .mockResolvedValue({ [Data.version.id]: Data.version.list[0] } as Record<string, any>);
    jest.spyOn(RelationService.prototype, 'formatRelationResponse').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161602);
  });

  it('response success with empty', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[1]);
    jest.spyOn(VersionNumberService.prototype, 'getLatestVersionNumber').mockResolvedValue(1);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161601);
  });

  it('response success with mock type', async () => {
    ctx.request.url = '/mocks/build-versions';
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[1]);
    jest.spyOn(VersionNumberService.prototype, 'getLatestVersionNumber').mockResolvedValue(1);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValue(Data.version.list[0] as any);

    jest
      .spyOn(VersionRelationService.prototype, 'getVersionRelations')
      .mockResolvedValue({ [Data.version.id]: Data.version.list[0] } as Record<string, any>);
    jest.spyOn(RelationService.prototype, 'formatRelationResponse').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161602);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    jest
      .spyOn(VersionNumberService.prototype, 'getLatestVersionNumber')
      .mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161601);
  });
});
