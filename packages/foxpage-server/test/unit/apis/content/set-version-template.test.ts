import { SetVersionTemplate } from '../../../../src/controllers/contents/set-version-template';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  versionId: '',
  templateId: '',
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
    templateId: Data.content.list[0].id,
  };
});

const appInstance = new SetVersionTemplate();

describe('Put: /contents/version/template', () => {
  it('response success', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.status = 'base';
    versionDetail.deleted = false;

    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail as any);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as any);
    jest.spyOn(VersionInfoService.prototype, 'updateDetail').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1070101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4070101);
  });

  it('response invalid templateId', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2070101);
  });

  it('response invalid templateId 2', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.status = 'base';
    versionDetail.deleted = false;

    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail as any);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2070102);
  });

  it('response invalid templateId 3', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.status = 'base';
    versionDetail.deleted = false;
    params.applicationId = Data.app.list[1].id;
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValueOnce(versionDetail as any);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2070103);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3070101);
  });
});
