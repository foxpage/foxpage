import { File, FileTypes } from '@foxpage/foxpage-server-types';

import { AddResourceFileDetail } from '../../../../src/controllers/resources/add-resource-files';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new AddResourceFileDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  folderId: Data.folder.id,
  name: '',
  intro: '',
  suffix: '',
  type: '' as FileTypes,
  tags: [] as any[],
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };
  params = {
    applicationId: Data.app.id,
    folderId: Data.folder.id,
    name: 'test name',
    intro: '',
    suffix: '',
    type: '' as FileTypes,
    tags: [] as any[],
  };
});

describe('Post: /resources', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'checkExist').mockResolvedValue(false);
    jest.spyOn(FileInfoService.prototype, 'create').mockReturnValue(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1120201);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(false);
    jest.spyOn(FileInfoService.prototype, 'checkExist').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4120201);
  });

  it('response invalid name', async () => {
    params.name = '';

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120201);
  });

  it('response file exist', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'checkExist').mockResolvedValue(true);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120203);
  });

  it('response invalid folder id', async () => {
    params.folderId = '';

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120202);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'checkExist').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3120201);
  });
});
