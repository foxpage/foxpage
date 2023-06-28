import _ from 'lodash';

import { Application } from '@foxpage/foxpage-server-types';

import { UpdateApplicationDetail } from '../../../../src/controllers/applications/update-applications';
import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdateApplicationDetail();
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

describe('Put: /applications', () => {
  it('response success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response success with diff slug', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'getDetail').mockResolvedValueOnce(<Application>{});

    params.slug = 'demo slug';
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response success with resource return code = 0', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'checkAppResourceUpdate').mockImplementation(() => {
      return { code: 0, data: [] };
    });

    params.resources = Data.app.list[0].resources;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response with resource return code = 1 ', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'checkAppResourceUpdate').mockImplementation(() => {
      return { code: 1, data: [] };
    });

    params.resources = Data.app.list[0].resources;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response with resource return code = 2 ', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'checkAppResourceUpdate').mockImplementation(() => {
      return { code: 2, data: [] };
    });

    params.resources = Data.app.list[0].resources;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response with resource return code = 3 ', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Object.assign({}, Data.app.list[0], { resources: [] }));
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'checkAppResourceUpdate').mockImplementation(() => {
      return { code: 3, data: [] };
    });

    params.resources = Data.app.list[0].resources;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response with resource return code = 4 ', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'checkAppResourceUpdate').mockImplementation(() => {
      return { code: 4, data: [] };
    });

    params.resources = Data.app.list[0].resources;
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response slug exist', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'updateDetail').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'getDetail').mockResolvedValueOnce(Data.app.list[0]);

    params.slug = 'demo slug';
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid appId', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<Application>{ deleted: true });
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response no auth', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
