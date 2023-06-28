import _ from 'lodash';

import { Application } from '@foxpage/foxpage-server-types';

import { GetStoreFileGoodsList } from '../../../../src/controllers/stores/get-page-file-goods';
import { ApplicationService } from '../../../../src/services/application-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { UserService } from '../../../../src/services/user-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetStoreFileGoodsList();
let ctx: Partial<FoxCtx> = {};

let params = {
  appIds: <string[]>[],
  type: '',
  search: '',
  page: 1,
  size: 10,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };
  params = {
    appIds: [Data.app.id],
    type: 'page',
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Post: /stores/goods-searchs', () => {
  it('response success', async () => {
    jest
      .spyOn(StoreGoodsService.prototype, 'getPageList')
      .mockResolvedValue(<any>{ count: 2, list: Data.store.goodsList });
    jest
      .spyOn(ApplicationService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(<Application[]>Data.app.list);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(<any>Data.user.userBaseObject);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1130401);
  });

  it('response error', async () => {
    jest.spyOn(StoreGoodsService.prototype, 'getPageList').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3130401);
  });
});
