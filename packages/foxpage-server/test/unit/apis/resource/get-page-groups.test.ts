import { GetResourceGroupPageList } from '../../../../src/controllers/resources/get-page-groups';
import { ApplicationService } from '../../../../src/services/application-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import Data from '../../../data';

const resInstance = new GetResourceGroupPageList();

let params = {
  applicationId: Data.app.id,
  search: '',
  page: 1,
  size: 10,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Post: /resources/group-searchs', () => {
  it('response success', async () => {
    jest
      .spyOn(FolderListService.prototype, 'getFolderPageList')
      .mockResolvedValue({ list: <any>Data.folder.list, count: 2 });
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValue(Data.app.list[0]);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderListService.prototype, 'getFolderPageList').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
