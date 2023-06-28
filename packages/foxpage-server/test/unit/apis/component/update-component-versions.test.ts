import { ContentVersion } from '@foxpage/foxpage-server-types';

import { UpdateComponentVersionDetail } from '../../../../src/controllers/components/update-components-versions';
import { AuthService } from '../../../../src/services/authorization-service';
import { ComponentService } from '../../../../src/services/component-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new UpdateComponentVersionDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.version.id,
  content: Data.version.componentList[0].content,
  version: '0.0.2',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
    content: Data.version.componentList[0].content,
    version: '0.0.2',
  };
});

describe('Put: /components/versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Object.assign({}, Data.version.list[0], { status: 'base' }));
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValue([]);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ComponentService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 0 });

    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response success with release data', async () => {
    params.content = <any>'text format';
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValue([]);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ComponentService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 0 });

    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Data.version.list[1]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Object.assign({}, Data.version.list[0], { status: 'base' }));
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValue(['meta']);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response version exist', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Object.assign({}, Data.version.list[0], { status: 'base' }));
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValue([]);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[1]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response component missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(VersionCheckService.prototype, 'contentFields').mockResolvedValue([]);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ComponentService.prototype, 'updateVersionDetail').mockResolvedValue({ code: 1, data: [] });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
