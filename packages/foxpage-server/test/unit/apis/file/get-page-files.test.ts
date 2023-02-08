import _ from 'lodash';

import { GetFileList } from '../../../../src/controllers/files/get-page-files';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import Data from '../../../data';

const appInstance = new GetFileList();
let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
  };
});

describe('Get: /files', () => {
  it('response success', async () => {
    jest.spyOn(FileListService.prototype, 'getPageData').mockResolvedValueOnce({ count: 0, list: [] });

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170401);
  });

  it('response success without id', async () => {
    params.id = '';
    jest.spyOn(FileListService.prototype, 'getPageData').mockResolvedValueOnce({ count: 0, list: [] });

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170401);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getPageData').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3170401);
  });
});
