import _ from 'lodash';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { GetPageVersionDetail } from '../../../../src/controllers/pages/get-page-version';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageVersionDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  versionId: '',
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/live-version',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    versionId: Data.version.id,
  };
});

describe('Post: /pages/live-version', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052101);
  });

  it('response success 2', async () => {
    params.versionId = '';
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(
        Object.assign({}, Data.content.list[0] as Content, { type: 'page', liveVersionId: '' }),
      );

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052103);
  });

  it('response success 3', async () => {
    params.versionId = '';
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(
        Object.assign({}, Data.content.list[0] as Content, { type: 'page', liveVersionId: Data.version.id }),
      );

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052104);
  });

  it('response success 4', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(
        Object.assign({}, Data.content.list[0] as Content, { type: 'page', liveVersionId: Data.version.id }),
      );
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as ContentVersion);
    jest.spyOn(VersionInfoService.prototype, 'getPageVersionInfo').mockResolvedValue({} as any);
    jest
      .spyOn(VersionInfoService.prototype, 'getTemplateDetailFromPage')
      .mockResolvedValueOnce(Data.version.list[1] as ContentVersion);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052102);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3052101);
  });
});
