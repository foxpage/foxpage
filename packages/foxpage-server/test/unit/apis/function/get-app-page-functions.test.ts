import { File } from '@foxpage/foxpage-server-types';

import { GetAppPageFunctionList } from '../../../../src/controllers/functions/get-app-page-functions';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FileAssoc } from '../../../../src/types/file-types';
import Data from '../../../data';

const varInstance = new GetAppPageFunctionList();

let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    page: 1,
    size: 10,
    search: '',
  };
});

describe('Get: /functions/file-searchs', () => {
  it('response list', async () => {
    jest
      .spyOn(FileListService.prototype, 'getAppTypeFilePageList')
      .mockResolvedValueOnce({ count: 2, list: <File[]>Data.file.list });
    jest.spyOn(FileListService.prototype, 'getFileAssocInfo').mockResolvedValueOnce(<FileAssoc[]>[]);
    const result = await varInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response list with empty file list', async () => {
    jest
      .spyOn(FileListService.prototype, 'getAppTypeFilePageList')
      .mockResolvedValueOnce({ count: 0, list: <File[]>[] });
    jest.spyOn(FileListService.prototype, 'getFileAssocInfo').mockResolvedValueOnce(<FileAssoc[]>[]);
    const result = await varInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(FileListService.prototype, 'getAppTypeFilePageList')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
