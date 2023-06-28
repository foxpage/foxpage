import _ from 'lodash';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { AddPageDetail } from '../../../../src/controllers/pages/add-pages';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddPageDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  name: '',
  intro: '',
  folderId: Data.folder.id,
  type: 'page' as FileTypes,
  tags: [],
  suffix: '',
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/contents',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    name: 'test name',
    intro: '',
    folderId: Data.folder.id,
    type: 'page' as FileTypes,
    tags: [],
    suffix: '',
  };
});

describe('Post: /pages', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest
      .spyOn(FileInfoService.prototype, 'addFileDetail')
      .mockResolvedValueOnce({ code: 0, data: Data.content.list[0] as any });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050201);
  });

  it('response invalid name', async () => {
    params.name = '';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050201);
  });

  it('response invalid folder id', async () => {
    params.folderId = '';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050202);
  });

  it('response file count greater 20', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getCount').mockResolvedValueOnce(21);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050206);
  });

  it('response invalid app id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 1, data: [] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050203);
  });

  it('response name exist', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 2, data: [] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050204);
  });

  it('response pathname exist', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 3, data: ['test'] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050205);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4050201);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3050201);
  });
});
