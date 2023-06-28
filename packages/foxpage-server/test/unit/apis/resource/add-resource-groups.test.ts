import { Folder } from '@foxpage/foxpage-server-types';

import { AddResourceGroupDetail } from '../../../../src/controllers/resources/add-resource-groups';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new AddResourceGroupDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  parentFolderId: Data.folder.id,
  name: '',
  intro: '',
  suffix: '',
  path: '',
  tags: [] as any[],
  config: {},
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
    tags: [{ type: 'resourceGroup', resourceId: Data.file.id }],
    config: { type: 'test' },
  };
});

describe('Post: /resources/groups', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockResolvedValue({ code: 0 });
    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1120401);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4120401);
  });

  it('response invalid name', async () => {
    params.name = '';

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120401);
  });

  it('response invalid tags', async () => {
    params.tags = [];
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120404);
  });

  it('response invalid type', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockResolvedValue({ code: 1 });

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120402);
  });

  it('response name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockResolvedValue({ code: 2 });

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120403);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3120401);
  });
});
