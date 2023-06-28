import _ from 'lodash';

import { Content, ContentVersion, File, Folder } from '@foxpage/foxpage-server-types';

import { AddAppsPageDetail } from '../../../../src/controllers/projects/add-project-pages';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddAppsPageDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  projectId: '',
  files: [] as any[],
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
    projectId: '',
    files: [
      {
        name: '',
        path: '',
        content: {},
      },
    ],
  };
});

describe('Post: /pages', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as Folder);
    jest
      .spyOn(FileInfoService.prototype, 'getFileDetailByNames')
      .mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue({} as Content);
    jest.spyOn(ContentInfoService.prototype, 'create').mockReturnValue(Data.content.list[0] as Content);
    jest
      .spyOn(VersionInfoService.prototype, 'create')
      .mockReturnValue(Data.version.list[0] as ContentVersion);
    jest.spyOn(ContentInfoService.prototype, 'updateContentItem').mockReturnValue();
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(false);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as Folder);

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(4040101);
  });

  it('response invalid project id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as Folder);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040101);
  });

  it('response invalid app id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Object.assign({}, Data.folder.list[0], { applicationId: '' }) as Folder);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040102);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockRejectedValue(new Error('mock error'));
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as Folder);

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3040101);
  });
});
