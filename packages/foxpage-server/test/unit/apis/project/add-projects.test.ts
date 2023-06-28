import _ from 'lodash';

// import { Content, ContentVersion, File, Folder } from '@foxpage/foxpage-server-types';
import { AddProjectDetail } from '../../../../src/controllers/projects/add-projects';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddProjectDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  name: '',
  organizationId: '',
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
    name: 'test project',
    organizationId: Data.org.id,
    intro: 'test intro',
    path: '',
  };
});

describe('Post: /projects', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockResolvedValue({ code: 0 });
    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040201);
  });

  // it('response no auth', async () => {
  //   jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(false);

  //   const result = await appInstance.index(<FoxCtx>ctx, params);
  //   expect(result.status).toEqual(4040201);
  // });

  it('response invalid name', async () => {
    params.name = '';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040201);
  });

  it('response invalid type', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockResolvedValue({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040202);
  });

  it('response project name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockResolvedValue({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040203);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'addTypeFolderDetail').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3040201);
  });
});
