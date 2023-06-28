import { AddComponentVersionDetail } from '../../../../src/controllers/components/add-component-versions';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new AddComponentVersionDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  contentId: Data.content.id,
  version: '0.0.5',
  content: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    contentId: Data.content.id,
    version: '0.0.5',
    content: {},
  };
});

describe('Post: /components/versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'isNewVersion').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValueOnce([]);
    jest.spyOn(VersionInfoService.prototype, 'create').mockReturnValueOnce(<any>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockReturnValueOnce(<any>Data.version.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response success with text content', async () => {
    params.content = <any>'text format';
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'isNewVersion').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValueOnce([]);
    jest.spyOn(VersionInfoService.prototype, 'create').mockReturnValueOnce(<any>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockReturnValueOnce(<any>Data.version.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid version number', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionNumberService.prototype, 'createNumberFromVersion').mockReturnValueOnce(0);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<any>null);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'isNewVersion').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValueOnce(['meta']);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
