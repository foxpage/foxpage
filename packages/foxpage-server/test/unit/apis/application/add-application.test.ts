import { Application, Folder } from '@foxpage/foxpage-server-types';

import { AddApplicationDetail } from '../../../../src/controllers/applications/add-applications';
import { ApplicationService } from '../../../../src/services/application-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { OrgService } from '../../../../src/services/organization-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddApplicationDetail();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    organizationId: Data.org.id,
    name: '',
    intro: '',
    host: [],
    slug: '',
    locales: [],
    resources: [],
  };
});

describe('Post: /applications', () => {
  it('response list', async () => {
    jest.spyOn(OrgService.prototype, 'checkOrgValid').mockResolvedValueOnce(true);
    jest.spyOn(ApplicationService.prototype, 'getDetail').mockResolvedValueOnce(Data.app.list[0] as any);
    jest.spyOn(ApplicationService.prototype, 'create').mockImplementation(() => {
      return <Application>Data.app.list[0];
    });
    jest.spyOn(FolderInfoService.prototype, 'create').mockImplementation(() => {
      return <Folder>Data.folder.list[0];
    });
    jest
      .spyOn(ApplicationService.prototype, 'getAppDetailWithFolder')
      .mockResolvedValueOnce(Object.assign({ folders: [] }, Data.app.list[0]) as any);
    jest.spyOn(ApplicationService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response invalid organization', async () => {
    jest.spyOn(OrgService.prototype, 'checkOrgValid').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response slug exist', async () => {
    params.slug = 'mock exist';
    jest.spyOn(OrgService.prototype, 'checkOrgValid').mockResolvedValueOnce(true);
    jest.spyOn(ApplicationService.prototype, 'getDetail').mockResolvedValueOnce(Data.app.list[0]);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2030102);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'checkOrgValid').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
