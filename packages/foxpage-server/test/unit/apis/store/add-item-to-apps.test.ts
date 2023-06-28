import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { AddStorePageItemToApplication } from '../../../../src/controllers/stores/add-item-to-apps';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { StoreOrderService } from '../../../../src/services/store-services/store-order-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddStorePageItemToApplication();
let ctx: Partial<FoxCtx> = {};

let params = {
  appIds: <string[]>[],
  goodsIds: <string[]>[],
  delivery: '',
  type: '',
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
    goodsIds: [Data.store.goodsList[0].id],
    delivery: 'reference',
    type: 'variable',
  };
});

describe('Post: /stores/items', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByIds').mockResolvedValue(<any[]>Data.store.goodsList);
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);
    jest.spyOn(FolderInfoService.prototype, 'getAppsTypeFolderId').mockResolvedValue({});
    jest.spyOn(FileInfoService.prototype, 'copyFile').mockResolvedValue({});
    jest.spyOn(StoreOrderService.prototype, 'addDetailQuery').mockResolvedValue(<never>{});
    jest.spyOn(StoreGoodsService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1130301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4130301);
  });

  it('response invalid goods ids', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByIds').mockResolvedValue(<any[]>[]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130301);
  });

  it('response invalid goods', async () => {
    const goodsList = _.cloneDeep(Data.store.goodsList);
    goodsList[0].deleted = true;
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByIds').mockResolvedValue(<any[]>goodsList);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130302);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3130301);
  });
});
