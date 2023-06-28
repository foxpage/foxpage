import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { UpdatePageDetail } from '../../../../src/controllers/pages/update-page-files';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdatePageDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  name: '',
  intro: '',
  pageFileId: '',
  tags: [] as any[],
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    name: 'test name',
    intro: 'test intro',
    pageFileId: '',
    tags: [],
  };
});

describe('Put: /pages', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051801);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051801);
  });

  it('response page name invalid', async () => {
    params.name = '';
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051801);
  });

  it('response page id invalid', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue({} as File);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051802);
  });

  it('response invalid page id 2', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051803);
  });

  it('response page name exist', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051804);
  });

  it('response path name exist', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValueOnce({ code: 3 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051805);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051801);
  });
});
