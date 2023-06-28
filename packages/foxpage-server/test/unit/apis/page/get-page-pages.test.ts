import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { GetPageList } from '../../../../src/controllers/pages/get-page-pages';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import Data from '../../../data';

const appInstance = new GetPageList();
let params = {
  applicationId: Data.app.id,
  fileId: '',
  page: 1,
  size: 10,
  search: '',
};
beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    fileId: Data.file.id,
    page: 1,
    size: 10,
    search: '',
  };
});

describe('Post: /pages/build-items', () => {
  it('response success', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.file.list[0] as File);
    jest
      .spyOn(FileContentService.prototype, 'getFilePageContent')
      .mockResolvedValueOnce({ count: 1, list: Data.content.list });

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1050801);
  });

  it('response invalid file', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as File);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2050801);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(params);

    expect(result.status).toEqual(3050801);
  });
});
