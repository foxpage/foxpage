import _ from 'lodash';

import { Content, Folder } from '@foxpage/foxpage-server-types';

import { GetProjectCatalog } from '../../../../src/controllers/projects/get-project-catalogs';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import Data from '../../../data';

const appInstance = new GetProjectCatalog();
let params = {
  applicationId: Data.app.id,
  id: '',
  deleted: false,
  type: '',
  search: '',
  page: 1,
  size: 10,
};
beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    deleted: false,
    type: 'user',
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Get: /project/catalogs', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValueOnce(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderListService.prototype, 'getAllChildrenRecursive').mockResolvedValueOnce({
      [Data.folder.id]: {
        folders: [],
        files: [
          {
            contents: <Content[]>Data.content.list,
          },
        ] as any[],
      },
    });

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1040501);
  });

  it('response invalid project id', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValueOnce(<Folder>{});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2040501);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);

    expect(result.status).toEqual(3040501);
  });
});
