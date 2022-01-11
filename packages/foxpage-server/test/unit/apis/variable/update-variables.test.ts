import { ContentVersion, File } from '@foxpage/foxpage-server-types';

import { UpdateVariableDetail } from '../../../../src/controllers/variables/update-variables';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new UpdateVariableDetail();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  content: {},
  name: '',
  type: '',
  intro: '',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    content: {},
    name: '',
    type: '',
    intro: '',
  };
});

describe('Put: /variables', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(VersionInfoService.prototype, 'getContentLatestVersion')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({});
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockImplementation();
    jest.spyOn(VersionInfoService.prototype, 'updateVersionItem').mockImplementation();
    jest
      .spyOn(VersionInfoService.prototype, 'create')
      .mockReturnValueOnce(<ContentVersion>Data.version.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response success with base data', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(VersionInfoService.prototype, 'getContentLatestVersion')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[1]);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({});
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockImplementation();
    jest.spyOn(VersionInfoService.prototype, 'updateVersionItem').mockImplementation();
    jest
      .spyOn(VersionInfoService.prototype, 'create')
      .mockReturnValueOnce(<ContentVersion>Data.version.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValueOnce([]);
    jest
      .spyOn(VersionInfoService.prototype, 'getContentLatestVersion')
      .mockResolvedValueOnce(<ContentVersion>{});
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({});
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>{});
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockImplementation();
    jest.spyOn(VersionInfoService.prototype, 'updateVersionItem').mockImplementation();
    jest
      .spyOn(VersionInfoService.prototype, 'create')
      .mockReturnValueOnce(<ContentVersion>Data.version.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid variable name', async () => {
    params.name = '!@#$%demo name';

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid variable id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValueOnce(Data.content.list);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 1 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response variable name exist', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValueOnce(Data.content.list);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 2 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockRejectedValue(new Error('mock error'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
