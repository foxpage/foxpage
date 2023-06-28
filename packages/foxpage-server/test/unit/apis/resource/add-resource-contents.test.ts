import { File } from '@foxpage/foxpage-server-types';

import { AddResourceContentDetail } from '../../../../src/controllers/resources/add-resource-contents';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new AddResourceContentDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  folderId: Data.folder.id,
  content: <any>{ realPath: 'aa/bb/cc.xxx.js' },
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
    content: <any>{ realPath: 'aa/bb/cc.xxx.js' },
  };
});

describe('put: /resources/group', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);
    jest.spyOn(FileInfoService.prototype, 'createFileContentVersion').mockReturnValue({});
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response invalid name', async () => {
    params.content = <any>{};

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response name exist', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValue(<File>Data.file.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
