import _ from 'lodash';

import { AddTypeItemDetail } from '../../../../src/controllers/files/add-type-items';
// import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
// import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddTypeItemDetail();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: 'variables',
  };
  ctx.userInfo = {
    id: Data.user.id,
    account: Data.user.account,
  };
  params = {
    applicationId: Data.app.id,
    name: 'test',
    type: 'page',
  };
});

describe('Post: /variables|/conditions|/functions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170701);
  });

  it('response invalid name', async () => {
    params.name = '!qwqw，asas';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170701);
  });

  it('response no auth 1', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4170701);
  });

  it('response no auth 2', async () => {
    params.pageContentId = Data.content.id;
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4170701);
  });

  it('response no auth 3', async () => {
    params.folderId = Data.folder.id;
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4170701);
  });

  it('response invalid folder id', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(null as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170702);
  });

  it('response invalid id', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 1 });
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170703);
  });

  it('response name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 2 });
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170704);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3170701);
  });
});
