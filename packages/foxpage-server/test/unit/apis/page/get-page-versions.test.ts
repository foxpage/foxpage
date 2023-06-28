import _ from 'lodash';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { GetPageTypeItemVersionList } from '../../../../src/controllers/pages/get-page-versions';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { UserService } from '../../../../src/services/user-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageTypeItemVersionList();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  contentId: '',
  page: 1,
  size: 10,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/versions',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    contentId: Data.content.id,
    page: 1,
    size: 10,
  };
});

describe('Post: /pages/versions', () => {
  it('response success with empty 2', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052402);
  });

  it('response success', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Object.assign({}, Data.content.list[0] as Content, { type: 'page' }));
    jest.spyOn(VersionInfoService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest
      .spyOn(VersionListService.prototype, 'find')
      .mockResolvedValueOnce(Data.version.list as ContentVersion[]);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052403);
  });

  it('response content id invalid', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as Content);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2052401);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3052401);
  });
});
