import { Folder } from '@foxpage/foxpage-server-types';

import { UpdateResourceFolderDetail } from '../../../../src/controllers/resources/update-resource-folders';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new UpdateResourceFolderDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.folder.list[0].applicationId,
  id: Data.folder.id,
  name: '',
  intro: '',
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.folder.list[0].applicationId,
    id: Data.folder.id,
    name: '',
    intro: '',
  };
});

describe('put: /resources/folders', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockResolvedValue(<any>{ [Data.folder.id]: [...(<Folder[]>Data.folder.list), {}] });
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);
    jest.spyOn(FolderInfoService.prototype, 'updateContentItem').mockReturnValue();

    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid name', async () => {
    params.name = '!@#$%query';

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid resource folder id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockResolvedValue(<any>{ [Data.folder.id]: [] });

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid resource folder id 2', async () => {
    params.applicationId = Data.app.id;
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockResolvedValue(<any>{ [Data.folder.id]: [...(<Folder[]>Data.folder.list), {}] });
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<any>null);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response name or path exist', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValue(true);
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockResolvedValue(<any>{ [Data.folder.id]: [...(<Folder[]>Data.folder.list), {}] });
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[0]);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
