import { AddComponentDetail } from '../../../../src/controllers/components/add-components';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new AddComponentDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  name: '@foxpage/component-name',
  type: 'component',
  componentType: '',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    name: '@foxpage/component-name',
    type: 'component',
    componentType: '',
  };
});

describe('Post: /components', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue(Data.folder.id);
    jest
      .spyOn(FileInfoService.prototype, 'addFileDetail')
      .mockResolvedValue({ code: 0, data: <any>{ id: Data.file.id } });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<any>Data.file.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid folder id', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue('');

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response invalid application id', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue(Data.folder.id);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValue({ code: 1 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response component name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue(Data.folder.id);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValue({ code: 2 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
