import { Content, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { UpdateResourceContentDetail } from '../../../../src/controllers/resources/update-resource-contents';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new UpdateResourceContentDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.folder.id,
  content: <any>{},
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    content: <any>{ realPath: 'aa/bb/cc.dd.js' },
  };
});

describe('put: /resources/group-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionItem').mockReturnValue();
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockReturnValue();
    jest.spyOn(FileInfoService.prototype, 'updateFileItem').mockReturnValue();
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);

    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response success with new version', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);
    jest.spyOn(VersionInfoService.prototype, 'create').mockReturnValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockReturnValue();
    jest.spyOn(FileInfoService.prototype, 'updateFileItem').mockReturnValue();
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);

    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid name', async () => {
    params.content = <any>{};
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response name exist', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValue(<File>Data.file.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
