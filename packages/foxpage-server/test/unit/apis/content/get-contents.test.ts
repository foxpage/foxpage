import { File } from '@foxpage/foxpage-server-types';

import { GetContentList } from '../../../../src/controllers/contents/get-contents';
// import { AuthService } from '../../../../src/services/authorization-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import Data from '../../../data';

const conInstance = new GetContentList();

let params = {
  applicationId: Data.app.id,
  fileId: '',
  deleted: false,
  search: '',
};

beforeEach(() => {
  jest.clearAllMocks();

  params = {
    applicationId: Data.app.id,
    fileId: '',
    deleted: false,
    search: '',
  };
});

describe('Get: /contents', () => {
  it('response success', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);
    jest.spyOn(FileContentService.prototype, 'getFileContentList').mockResolvedValueOnce([]);

    const result = await conInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response invalid file id', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<any>null);

    const result = await conInstance.index(params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await conInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
