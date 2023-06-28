import '../../../../../src/services/content-services/index';

import { ContentTagService } from '../../../../../src/services/content-services/content-tag-service';
import { FileInfoService } from '../../../../../src/services/file-services/file-info-service';
import { VersionInfoService } from '../../../../../src/services/version-services/version-info-service';
import Data from '../../../../data';

const appInstance = ContentTagService.getInstance();
let params = {
  applicationId: '',
  tags: [],
  pathname: '',
  fileId: '',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    tags: [],
    pathname: '/test/pathname',
    fileId: '',
  };
});

describe('Service content/tag/getAppContentByTags', () => {
  it('response success', async () => {
    jest
      .spyOn(FileInfoService.prototype, 'getFileDetailByPathname')
      .mockResolvedValueOnce(Data.file.list[0] as any);
    jest
      .spyOn(ContentTagService.prototype, 'getAppContentLiveInfoByTags')
      .mockResolvedValueOnce(Data.content.list[0]);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as any);

    const result = await appInstance.getAppContentByTags(params);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual('cont_cuREMD9zcUZEcVU');
  });

  it('response preview result', async () => {
    params.fileId = '';
    params.tags = [{ query: { preview: 1 } }] as never;
    jest
      .spyOn(FileInfoService.prototype, 'getFileDetailByPathname')
      .mockResolvedValueOnce(Data.file.list[0] as any);
    jest
      .spyOn(ContentTagService.prototype, 'getAppContentLiveInfoByTags')
      .mockResolvedValueOnce(Data.content.list[0]);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);

    const result = await appInstance.getAppContentByTags(params);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual('cont_cuREMD9zcUZEcVU');
  });

  it('response empty', async () => {
    params.fileId = Data.file.id;
    jest.spyOn(FileInfoService.prototype, 'getFileDetailByPathname').mockResolvedValueOnce({});

    const result = await appInstance.getAppContentByTags(params);
    expect(result.length).toEqual(0);
  });
});
