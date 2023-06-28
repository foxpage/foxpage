import { LockBuildContent } from '../../../../src/controllers/contents/lock-build-content';
import { AuthService } from '../../../../src/services/authorization-service';
// import { ContentLogService } from '../../../../src/services/content-log-service';
// import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
// import { LogService } from '../../../../src/services/log-service';
import { UserService } from '../../../../src/services/user-service';
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

const appInstance = new LockBuildContent();

describe('Put: /contents/lock', () => {
  it('response success', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.status = 'base';
    versionDetail.deleted = false;

    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail as any);

    jest.spyOn(UserService.prototype, 'getDetailById').mockResolvedValueOnce(Data.user.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'updateDetail').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161201);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161201);
  });
});
