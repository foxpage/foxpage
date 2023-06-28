import _ from 'lodash';

import { Application, Folder, Team } from '@foxpage/foxpage-server-types';

import { GetProjectPageList } from '../../../../src/controllers/projects/get-page-projects';
import { ApplicationService } from '../../../../src/services/application-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { OrgService } from '../../../../src/services/organization-service';
import { TeamService } from '../../../../src/services/team-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetProjectPageList();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  organizationId: Data.org.id,
  type: '',
  typeId: '',
  searchType: 'file',
  search: '',
  page: 1,
  size: 10,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/project-searchs',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    organizationId: Data.org.id,
    type: 'user',
    typeId: '',
    searchType: 'file',
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Get: /project-searchs', () => {
  it('response success', async () => {
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(true);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.app.list[0] as Application);
    jest.spyOn(TeamService.prototype, 'find').mockResolvedValueOnce(Data.team.list as Team[]);
    jest
      .spyOn(FolderListService.prototype, 'getInvolveFileProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getInvolveProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getUserFolderListByFile')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });
    jest
      .spyOn(FolderListService.prototype, 'getFolderChildrenList')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040401);
  });

  it('response user not in org', async () => {
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040401);
  });

  it('response success with application id is empty', async () => {
    params.applicationId = '';
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(true);
    jest.spyOn(ApplicationService.prototype, 'find').mockResolvedValueOnce(Data.app.list as Application[]);
    jest.spyOn(TeamService.prototype, 'find').mockResolvedValueOnce(Data.team.list as Team[]);
    jest
      .spyOn(FolderListService.prototype, 'getInvolveFileProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getInvolveProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getUserFolderListByFile')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });
    jest
      .spyOn(FolderListService.prototype, 'getFolderChildrenList')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040401);
  });

  it('response success with type in valid', async () => {
    params.applicationId = '';
    params.type = 'invalid';
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(true);
    jest.spyOn(ApplicationService.prototype, 'find').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040402);
  });

  it('response success with type is team', async () => {
    params.type = 'team';
    params.searchType = 'content';
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(true);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.app.list[0] as Application);
    jest.spyOn(TeamService.prototype, 'find').mockResolvedValueOnce(Data.team.list as Team[]);
    jest
      .spyOn(FolderListService.prototype, 'getInvolveFileProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getInvolveProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getUserFolderListByFile')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });
    jest
      .spyOn(FolderListService.prototype, 'getFolderChildrenList')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040401);
  });

  it('response success with type is involve', async () => {
    params.type = 'involve';
    params.searchType = 'file';
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(true);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.app.list[0] as Application);
    jest.spyOn(TeamService.prototype, 'find').mockResolvedValueOnce(Data.team.list as Team[]);
    jest
      .spyOn(FolderListService.prototype, 'getInvolveFileProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getInvolveProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getUserFolderListByFile')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });
    jest
      .spyOn(FolderListService.prototype, 'getFolderChildrenList')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040401);
  });

  it('response success with search type is content', async () => {
    params.type = 'involve';
    params.searchType = 'content';
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockResolvedValueOnce(true);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.app.list[0] as Application);
    jest.spyOn(TeamService.prototype, 'find').mockResolvedValueOnce(Data.team.list as Team[]);
    jest
      .spyOn(FolderListService.prototype, 'getInvolveFileProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getInvolveProject')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as Folder[] });

    jest
      .spyOn(FolderListService.prototype, 'getUserFolderListByFile')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });
    jest
      .spyOn(FolderListService.prototype, 'getFolderChildrenList')
      .mockResolvedValueOnce({ count: 1, list: Data.folder.list as any[] });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040401);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'checkUserInOrg').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3040401);
  });
});
