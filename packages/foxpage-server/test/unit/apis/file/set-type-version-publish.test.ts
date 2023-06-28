import _ from 'lodash';

import { SetItemVersionPublishStatus } from '../../../../src/controllers/files/set-type-version-publish';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetItemVersionPublishStatus();
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
  ctx.request = {
    url: 'variables/version-publish',
  };
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
  };
});

describe('Put: /variables/version-publish', () => {
  it('response success', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.deleted = false;
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getContentLatestVersion').mockResolvedValue(versionDetail);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue(versionDetail);

    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true } as any);
    jest
      .spyOn(VersionLiveService.prototype, 'setVersionPublishStatus')
      .mockResolvedValueOnce({ code: 0 } as any);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 0 } as any);
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170901);
  });

  it('response success with content id', async () => {
    params.id = '';
    params.contentId = Data.content.id;
    const versionDetail = Data.version.list[1] as any;
    versionDetail.deleted = false;
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getContentLatestVersion').mockResolvedValue(versionDetail);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue(versionDetail);

    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true } as any);
    jest
      .spyOn(VersionLiveService.prototype, 'setVersionPublishStatus')
      .mockResolvedValueOnce({ code: 0 } as any);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 0 } as any);
    jest.spyOn(VersionLiveService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170901);
  });

  it('response item has published', async () => {
    params.id = '';
    params.contentId = Data.content.id;
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest
      .spyOn(VersionInfoService.prototype, 'getContentLatestVersion')
      .mockResolvedValue(Data.version.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170902);
  });

  it('response invalid version data', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.deleted = false;
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getContentLatestVersion').mockResolvedValue(versionDetail);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue(versionDetail);

    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: false } as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170903);
  });

  it('response version has published 2', async () => {
    const versionDetail = Data.version.list[1] as any;
    versionDetail.deleted = false;
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(true);
    jest.spyOn(VersionInfoService.prototype, 'getContentLatestVersion').mockResolvedValue(versionDetail);
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockResolvedValue(versionDetail);

    jest
      .spyOn(VersionCheckService.prototype, 'versionCanPublish')
      .mockResolvedValueOnce({ publishStatus: true } as any);
    jest
      .spyOn(VersionLiveService.prototype, 'setVersionPublishStatus')
      .mockResolvedValueOnce({ code: 1 } as any);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 0 } as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170904);
  });

  it('response invalid item id', async () => {
    params.id = '';
    params.contentId = '';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170901);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4170901);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'version').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3170901);
  });
});
