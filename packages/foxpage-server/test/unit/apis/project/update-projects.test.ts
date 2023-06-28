import _ from 'lodash';

import { Folder } from '@foxpage/foxpage-server-types';

import { UpdateProjectDetail } from '../../../../src/controllers/projects/update-projects';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdateProjectDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  projectId: '',
  name: '',
  intro: '',
  path: '',
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/projects',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    projectId: Data.folder.id,
    name: 'test project name',
    intro: 'test intro',
    path: '',
  };
});

describe('Put: /projects', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateTypeFolderDetail').mockResolvedValue({ code: 0 });
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040901);
  });

  it('response invalid name', async () => {
    params.name = '';
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040901);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4040901);
  });

  it('response invalid project id', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateTypeFolderDetail').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040902);
  });

  it('response project name exist', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateTypeFolderDetail').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040903);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'folder').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3040901);
  });
});
