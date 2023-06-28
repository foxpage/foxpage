import _ from 'lodash';

import { OfflineGoodsFromStore } from '../../../../src/controllers/stores/offline-goods-from-store';
import { AuthService } from '../../../../src/services/authorization-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new OfflineGoodsFromStore();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: '',
  id: '',
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
    applicationId: Data.app.id,
    id: Data.file.id,
  };
});

describe('Post: /stores/goods-offline', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByAppFileId')
      .mockResolvedValue(<any>Data.store.goodsList[0]);
    jest.spyOn(StoreGoodsService.prototype, 'updateDetail').mockResolvedValue(<any>Data.store.goodsList[0]);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<any>Data.store.goodsList[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1130701);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4130701);
  });

  it('response invalid goods id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByAppFileId').mockResolvedValue(<any>{});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130701);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3130701);
  });
});
