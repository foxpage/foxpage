import { File } from '@foxpage/foxpage-server-types';

import { GetResourceContentList } from '../../../../src/controllers/resources/get-resource-contents';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import Data from '../../../data';

const resInstance = new GetResourceContentList();

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
  };
});

describe('Get: /resources/contents', () => {
  it('response success', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(FileContentService.prototype, 'getFileContentList').mockResolvedValue(<any>Data.content.list);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response invalid id', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<any>null);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
