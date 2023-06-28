import _ from 'lodash';

import { GetPageMockList } from '../../../../src/controllers/mocks/get-page-mocks';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const appInstance = new GetPageMockList();

let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    folderId: Data.folder.id,
    type: 'mock',
    page: 1,
    size: 10,
    search: '',
  };
});

describe('Post: /mocks', () => {
  it('response success', async () => {
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.folder.list[0] as any);
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.id as any);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValueOnce(Data.content.list as any);
    jest
      .spyOn(VersionListService.prototype, 'getContentMaxVersionDetail')
      .mockResolvedValueOnce({ [Data.content.id]: Data.version.list[0] } as any);
    jest
      .spyOn(VersionListService.prototype, 'getVersionListRelations')
      .mockResolvedValueOnce({ [Data.content.id]: Data.version.list[0] } as any);

    const result = await appInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(params);

    expect(result.code).toEqual(500);
  });
});
