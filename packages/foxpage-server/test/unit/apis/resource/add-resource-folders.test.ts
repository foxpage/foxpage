import { Folder } from '@foxpage/foxpage-server-types';

import { AddAssetDetail } from '../../../../src/controllers/resources/add-resource-folders';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new AddAssetDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  parentFolderId: Data.folder.id,
  name: '',
  intro: '',
  suffix: '',
  path: '',
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
    parentFolderId: Data.folder.id,
    name: 'test name',
    intro: '',
    suffix: '',
    path: '',
    tags: [] as any[],
  };
});

describe('Post: /resources/folders', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>{});
    jest.spyOn(FolderInfoService.prototype, 'create').mockReturnValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1120301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4120301);
  });

  it('response invalid name', async () => {
    params.name = '';

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120301);
  });

  it('response name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValueOnce(<Folder>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120302);
  });

  it('response path exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValueOnce(<Folder>{});
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValueOnce(<Folder>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120303);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3120301);
  });
});
