import _ from 'lodash';

import { Content, File } from '@foxpage/foxpage-server-types';

import { AddStorePackageToApplication } from '../../../../src/controllers/stores/add-package-to-apps';
import { AuthService } from '../../../../src/services/authorization-service';
import { ComponentContentService } from '../../../../src/services/content-services/component-content-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { LogService } from '../../../../src/services/log-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { StoreOrderService } from '../../../../src/services/store-services/store-order-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddStorePackageToApplication();
let ctx: Partial<FoxCtx> = {};

let params = {
  appIds: <string[]>[],
  goodsIds: <string[]>[],
  delivery: '',
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
    delivery: 'clone',
  };
});

describe('Post: /stores/packages', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByIds').mockResolvedValue(<any[]>Data.store.goodsList);
    jest.spyOn(FolderInfoService.prototype, 'getAppsTypeFolderId').mockResolvedValue({});
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValueOnce(<Content[]>Data.content.list);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>[]);
    jest.spyOn(FileListService.prototype, 'getReferencedByIds').mockResolvedValueOnce({});
    jest.spyOn(FileInfoService.prototype, 'create').mockReturnValue(<File>Data.file.list[0]);
    jest.spyOn(ComponentContentService.prototype, 'cloneContent').mockResolvedValueOnce();
    jest.spyOn(LogService.prototype, 'addLogItem').mockReturnValue(<any[]>[]);
    jest.spyOn(StoreOrderService.prototype, 'addDetailQuery').mockResolvedValue(<never>{});
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1130201);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4130201);
  });

  it('response app exist package', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(StoreGoodsService.prototype, 'getDetailByIds').mockResolvedValue(<any[]>Data.store.goodsList);
    jest.spyOn(FolderInfoService.prototype, 'getAppsTypeFolderId').mockResolvedValue({});
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValueOnce(<Content[]>Data.content.list);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2130201);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3130201);
  });
});
