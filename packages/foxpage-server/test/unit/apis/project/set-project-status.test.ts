import _ from 'lodash';

import { Folder } from '@foxpage/foxpage-server-types';

import { SetFolderStatus } from '../../../../src/controllers/projects/set-project-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileCheckService } from '../../../../src/services/file-services/file-check-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetFolderStatus();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  projectId: '',
  filter: {
    pathList: [] as any[],
  },
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/project/status',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    projectId: Data.folder.id,
    filter: {
      pathList: ['test-path'],
    },
  };
});

describe('Put: /project/status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValue([]);
    jest.spyOn(FolderListService.prototype, 'getAllChildrenRecursive').mockResolvedValue({});
    jest
      .spyOn(FolderListService.prototype, 'getIdsFromFolderChildren')
      .mockResolvedValue({ folders: [], files: [], contents: [], versions: [] } as any);

    jest.spyOn(FolderInfoService.prototype, 'batchSetFolderDeleteStatus').mockReturnValue();
    jest.spyOn(FileInfoService.prototype, 'batchSetFileDeleteStatus').mockReturnValue();
    jest.spyOn(ContentInfoService.prototype, 'batchSetContentDeleteStatus').mockReturnValue();
    jest.spyOn(VersionInfoService.prototype, 'batchSetVersionDeleteStatus').mockReturnValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040801);
  });

  it('response invalid project id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>{});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040801);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(false);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4040801);
  });

  it('response is system folder', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<Folder>Object.assign({}, Data.folder.list[0], { parentFolderId: '' }));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040802);
  });

  it('response has live content', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValue([Data.file.id]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040803);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3040801);
  });
});
