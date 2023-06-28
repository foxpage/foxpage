import { ContentVersion } from '@foxpage/foxpage-server-types';

import { SetContentLiveVersion } from '../../../../src/controllers/contents/set-live-version';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const conInstance = new SetContentLiveVersion();

let params = {
  applicationId: Data.app.id,
  contentId: '',
  versionNumber: 1,
  versionId: '',
};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    contentId: Data.content.list[0].id,
    versionNumber: 1,
    versionId: '',
  };
});

describe('Put: /content/version/live', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockReturnValue();
    jest.spyOn(ContentLiveService.prototype, 'setLiveContent').mockResolvedValueOnce({} as never);
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response invalid version', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValueOnce(<any>null);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(<any>null);

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
