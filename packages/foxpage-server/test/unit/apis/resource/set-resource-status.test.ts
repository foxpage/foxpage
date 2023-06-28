import { File, Folder } from '@foxpage/foxpage-server-types';

import { SetResourceFileContentStatus } from '../../../../src/controllers/resources/set-resource-status';
// import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new SetResourceFileContentStatus();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  ids: [Data.folder.id],
  status: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    ids: [Data.folder.id],
    status: true,
  };
});

describe('put: /resources/group-status', () => {
  it('response success', async () => {
    // jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest.spyOn(FolderListService.prototype, 'getAllParentsRecursive').mockResolvedValue({});
    jest.spyOn(FolderInfoService.prototype, 'getDetailByIds').mockResolvedValue(<Folder[]>Data.folder.list);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValue(<File[]>Data.file.list);
    jest.spyOn(FolderInfoService.prototype, 'setDeleteStatus').mockResolvedValue({});
    jest.spyOn(FileInfoService.prototype, 'setDeleteStatus').mockResolvedValue({});

    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  // it('response no auth', async () => {
  //   jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(false);

  //   const result = await resInstance.index(<FoxCtx>ctx, params);

  //   expect(result.code).toEqual(403);
  // });

  it('response invalid resource folder id', async () => {
    // jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockResolvedValue(<any>{ [Data.folder.id]: [{ parentFolderId: '' }, {}] });

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
