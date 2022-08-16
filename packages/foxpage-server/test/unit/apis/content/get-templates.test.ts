import { ContentVersion, File } from '@foxpage/foxpage-server-types';

import { GetTemplates } from '../../../../src/controllers/contents/get-templates';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const conInstance = new GetTemplates();

let params = {
  applicationId: Data.app.id,
  page: 1,
  size: 10,
};

beforeEach(() => {
  jest.clearAllMocks();

  params = {
    applicationId: Data.app.id,
    page: 1,
    size: 10,
  };
});

describe('Get: /templates', () => {
  it('response success', async () => {
    jest.spyOn(FileListService.prototype, 'getAppTypeFileList').mockResolvedValueOnce(<File[]>Data.file.list);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(VersionListService.prototype, 'getContentByIdAndVersionNumber')
      .mockResolvedValueOnce(<ContentVersion[]>Data.version.list);

    const result = await conInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getAppTypeFileList').mockRejectedValue(new Error('mock error'));

    const result = await conInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
