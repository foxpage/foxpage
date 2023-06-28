import _ from 'lodash';

import { Application, Content, Folder } from '@foxpage/foxpage-server-types';

import { GetProjectFileList } from '../../../../src/controllers/projects/get-page-project-files';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FileInfo } from '../../../../src/types/file-types';
import Data from '../../../data';

const appInstance = new GetProjectFileList();
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
    type: '',
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Post: /projects', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(Data.folder.list[0] as Folder);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.app.list[0] as Application);
    jest
      .spyOn(FileListService.prototype, 'getPageData')
      .mockResolvedValueOnce({ count: 1, list: Data.file.list as FileInfo[] });
    jest.spyOn(ContentListService.prototype, 'find').mockResolvedValueOnce(Data.content.list as Content[]);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1040301);
  });

  it('response invalid project', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue({} as Folder);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2040301);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);

    expect(result.status).toEqual(3040301);
  });
});
