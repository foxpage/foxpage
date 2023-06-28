import { Folder } from '@foxpage/foxpage-server-types';

import { SetResourceFolderStatus } from '../../../../src/controllers/resources/set-resource-folder-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new SetResourceFolderStatus();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  status: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

describe('put: /resources/folder-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'setFolderDeleteStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid file id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'setFolderDeleteStatus').mockResolvedValue({ code: 1 });

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FolderInfoService.prototype, 'setFolderDeleteStatus').mockResolvedValue({ code: 2 });

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
