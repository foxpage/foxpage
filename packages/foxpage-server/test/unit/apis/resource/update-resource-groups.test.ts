import { Folder } from '@foxpage/foxpage-server-types';

import { UpdateResourceGroup } from '../../../../src/controllers/resources/update-resource-groups';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new UpdateResourceGroup();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.folder.id,
  name: '',
  intro: '',
  config: {},
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    name: 'demo name',
    intro: '',
    config: {},
  };
});

describe('put: /resources/group', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<any>Data.folder.resourceGroupList[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValue(<any>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid name', async () => {
    params.name = '';

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid resource group id', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<any>[]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response group name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<any>Data.folder.resourceGroupList[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValue(<Folder[]>Data.folder.list);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
