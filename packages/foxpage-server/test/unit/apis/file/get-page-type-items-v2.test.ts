import _ from 'lodash';

import { GetTypeItemList } from '../../../../src/controllers/files/get-page-type-items-v2';
import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
// import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
// import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
// import { LogService } from '../../../../src/services/log-service';
import { UserService } from '../../../../src/services/user-service';
// import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
// import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetTypeItemList();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id,
    account: Data.user.account,
  };
  params = {
    applicationId: Data.app.id,
    type: 'project',
    typeId: Data.file.id,
    userType: 'user',
  };
});

describe('Get: /search', () => {
  it('response success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    // jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    // jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  it('response success with type is template', async () => {
    params.type = 'template';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  it('response success with type is variable', async () => {
    params.type = 'variable';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  it('response success with type is project_condition', async () => {
    params.type = 'project_condition';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  it('response success with type is content', async () => {
    params.type = 'content';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  it('response success by user type is involve', async () => {
    params.userType = 'involve';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'aggregate').mockResolvedValueOnce([]);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    // jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    // jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  it('response success with org id', async () => {
    params.applicationId = '';
    params.organizationId = Data.org.id;
    jest.spyOn(ApplicationService.prototype, 'find').mockResolvedValueOnce(Data.app.list as any[]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(Data.folder.list as any[]);
    // jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    // jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any[]);

    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1171001);
  });

  // it('response error', async () => {
  //   jest
  //     .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
  //     .mockRejectedValue(new Error('mock error'));

  //   const result = await appInstance.index(<FoxCtx>ctx, params);
  //   expect(result.status).toEqual(3051001);
  // });
});
