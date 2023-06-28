// import { StoreGoods } from '@foxpage/foxpage-server-types';

import { GetPageComponentList } from '../../../../src/controllers/components/get-page-components';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { FileUserInfo } from '../../../../src/types/file-types';
import Data from '../../../data';

const comInstance = new GetPageComponentList();

let params = {
  applicationId: Data.app.id,
  type: '',
  search: '',
  page: 1,
  size: 10,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    type: '',
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Get: /components/version-infos', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue(Data.folder.id);
    jest
      .spyOn(FileListService.prototype, 'getPageData')
      .mockResolvedValue({ list: <FileUserInfo[]>Data.file.fileWithUser, count: 1 });
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest.spyOn(StoreGoodsService.prototype, 'find').mockResolvedValue(<any[]>Data.store.goodsList);

    const result = await comInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response invalid folder type', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue('');

    const result = await comInstance.index(params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
