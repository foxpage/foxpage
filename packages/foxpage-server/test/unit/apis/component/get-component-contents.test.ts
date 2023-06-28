import { File } from '@foxpage/foxpage-server-types';

import { GetComponentVersionDetail } from '../../../../src/controllers/components/get-component-contents';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { StoreGoodsService } from '../../../../src/services/store-services/store-goods-service';
import { UserService } from '../../../../src/services/user-service';
import Data from '../../../data';

const comInstance = new GetComponentVersionDetail();

let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
  };
});

describe('Get: /components/contents', () => {
  it('response success', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValue({});
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByTypeId')
      .mockResolvedValue(<any>Data.store.goodsList[0]);

    const result = await comInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response success with diff data', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[1]);
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(Data.content.list[0]);
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValue({});
    jest
      .spyOn(StoreGoodsService.prototype, 'getDetailByTypeId')
      .mockResolvedValue(<any>Data.store.goodsList[0]);

    const result = await comInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response invalid file id', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);

    const result = await comInstance.index(params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
