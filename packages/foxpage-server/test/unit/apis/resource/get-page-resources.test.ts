import { GetResourcePageList } from '../../../../src/controllers/resources/get-page-resources';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import Data from '../../../data';

const resInstance = new GetResourcePageList();

let params = {
  applicationId: Data.app.id,
  parentFolderId: Data.folder.id,
  search: '',
  page: 1,
  size: 10,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    parentFolderId: Data.folder.id,
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Post: /resource-searchs', () => {
  it('response success', async () => {
    jest
      .spyOn(FolderListService.prototype, 'getFolderPageList')
      .mockResolvedValue({ list: <any>Data.folder.list, count: 2 });

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderListService.prototype, 'getFolderPageList').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
