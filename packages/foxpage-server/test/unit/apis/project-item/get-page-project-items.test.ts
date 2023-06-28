import _ from 'lodash';

import { File, Folder } from '@foxpage/foxpage-server-types';

import { GetProjectItemsList } from '../../../../src/controllers/project-items/get-page-project-items';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { UserService } from '../../../../src/services/user-service';
import Data from '../../../data';

const appInstance = new GetProjectItemsList();
let params = {
  organizationId: Data.org.id,
  applicationId: Data.app.id,
  search: '',
  page: 1,
  size: 10,
};
beforeEach(() => {
  params = {
    organizationId: Data.org.id,
    applicationId: Data.app.id,
    search: 'test',
    page: 1,
    size: 10,
  };
});

describe('Get: /page-content/search', () => {
  it('response success', async () => {
    jest.spyOn(ApplicationService.prototype, 'find').mockResolvedValueOnce(Data.app.list);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(2);
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(2);
    jest.spyOn(ContentListService.prototype, 'aggregate').mockResolvedValueOnce([{ count: 1 }]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(<Folder[]>Data.folder.list);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>Data.file.list);
    jest
      .spyOn(FolderListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(<Folder[]>Data.folder.list);
    jest.spyOn(ApplicationService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.app.list);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(<any>Data.user.userBaseObject);
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1200201);
  });

  it('response success without app id', async () => {
    params.applicationId = '';
    params.search = '';
    jest.spyOn(ApplicationService.prototype, 'find').mockResolvedValueOnce([]);
    jest.spyOn(FolderListService.prototype, 'getCount').mockResolvedValueOnce(2);
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(2);
    jest.spyOn(ContentListService.prototype, 'aggregate').mockResolvedValueOnce([{ count: 1 }]);
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValueOnce(<Folder[]>Data.folder.list);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>Data.file.list);
    jest
      .spyOn(FolderListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(<Folder[]>Data.folder.list);
    jest.spyOn(ApplicationService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.app.list);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(<any>Data.user.userBaseObject);
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1200201);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getCount').mockRejectedValue(new Error('mock error'));
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await appInstance.index(params);

    expect(result.status).toEqual(3200201);
  });
});
