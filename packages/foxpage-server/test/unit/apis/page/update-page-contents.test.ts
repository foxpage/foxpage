import _ from 'lodash';

import { Content } from '@foxpage/foxpage-server-types';

import { UpdatePageContentDetail } from '../../../../src/controllers/pages/update-page-contents';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdatePageContentDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  title: '',
  isBase: false,
  extendId: '',
  pageContentId: '',
  tags: [],
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
    id: Data.content.id,
    title: 'test title',
    isBase: false,
    extendId: '',
    pageContentId: '',
    tags: [],
  };
});

describe('Put: /pages/contents', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051701);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051701);
  });

  it('response invalid page content id', async () => {
    params.isBase = true;
    params.extendId = Data.content.id;

    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051701);
  });

  it('response invalid id type', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051702);
  });

  it('response page name exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 3 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051703);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051701);
  });
});
