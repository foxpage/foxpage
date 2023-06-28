import _ from 'lodash';

import { Content, StoreGoods } from '@foxpage/foxpage-server-types';

import { SetPageContentOffline } from '../../../../src/controllers/pages/set-page-offline';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageContentOffline();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  status: true,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/content-offline',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

describe('Put: /pages/content-offline', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(
        Object.assign({}, Data.content.list[0] as Content, { liveVersionId: Data.version.id }),
      );
    jest.spyOn(ContentListService.prototype, 'find').mockResolvedValueOnce(<Content[]>[]);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByAppFileId').mockResolvedValueOnce(<StoreGoods>{});
    jest.spyOn(ContentInfoService.prototype, 'updateDetail').mockResolvedValueOnce({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.content.list[0] as Content);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4052301);
  });

  it('response page has offline', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<Content>Data.content.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2052301);
  });

  it('response page is online', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(
        Object.assign({}, Data.content.list[0] as Content, { liveVersionId: Data.version.id }),
      );
    jest.spyOn(ContentListService.prototype, 'find').mockResolvedValueOnce(<Content[]>[]);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByAppFileId')
      .mockResolvedValueOnce(<StoreGoods>{ status: 1, deleted: false });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2052302);
  });

  it('response has live version', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(
        Object.assign({}, Data.content.list[0] as Content, { liveVersionId: Data.version.id }),
      );
    jest.spyOn(ContentListService.prototype, 'find').mockResolvedValueOnce(<Content[]>Data.content.list);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByAppFileId').mockResolvedValueOnce(<StoreGoods>{});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2052303);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(Data.content.list[0] as Content);
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3052301);
  });
});
