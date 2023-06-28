import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { AddGoodsToStore } from '../../../../src/controllers/stores/add-goods-to-store';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddGoodsToStore();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: '',
  type: '',
  intro: '',
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
    id: Data.content.list[1].fileId,
    type: 'page',
    intro: 'test intro',
  };
});

describe('Post: /stores/goods', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByTypeId')
      .mockResolvedValue(Object.assign({}, Data.store.goodsList[0], { status: 0 }) as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest
      .spyOn(ContentListService.prototype, 'getFileContentList')
      .mockResolvedValue(_.keyBy(Data.content.list, 'fileId') as any);
    jest.spyOn(StoreGoodsService.prototype, 'updateDetail').mockResolvedValue({});
    jest.spyOn(StoreGoodsService.prototype, 'addDetail').mockResolvedValue([]);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailById')
      .mockResolvedValue(Data.store.goodsList[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1130101);
  });

  it('response success 2', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByTypeId').mockResolvedValue(undefined as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest
      .spyOn(ContentListService.prototype, 'getFileContentList')
      .mockResolvedValue(_.keyBy(Data.content.list, 'fileId') as any);
    jest.spyOn(StoreGoodsService.prototype, 'updateDetail').mockResolvedValue({});
    jest.spyOn(StoreGoodsService.prototype, 'addDetail').mockResolvedValue([]);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailById')
      .mockResolvedValue(Data.store.goodsList[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1130101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4130101);
  });

  it('response goods exist', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByTypeId')
      .mockResolvedValue(Object.assign({}, Data.store.goodsList[0], { status: 1 }) as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest
      .spyOn(ContentListService.prototype, 'getFileContentList')
      .mockResolvedValue(_.keyBy(Data.content.list, 'fileId') as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130101);
  });

  it('response invalid type Id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByTypeId')
      .mockResolvedValue(Object.assign({}, Data.store.goodsList[0], { status: 0 }) as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>{});
    jest
      .spyOn(ContentListService.prototype, 'getFileContentList')
      .mockResolvedValue(_.keyBy(Data.content.list, 'fileId') as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130102);
  });

  it('response must have live version', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByTypeId').mockResolvedValue({} as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest.spyOn(ContentListService.prototype, 'getFileContentList').mockResolvedValue({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130103);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3130101);
  });
});
