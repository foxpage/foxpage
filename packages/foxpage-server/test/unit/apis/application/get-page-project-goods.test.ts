import { Content, File, Folder } from '@foxpage/foxpage-server-types';

import { GetApplicationProjectGoodsList } from '../../../../src/controllers/applications/get-page-project-goods';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import Data from '../../../data';

const apiPath = '/applications/project-goods-searchs';
const appInstance = new GetApplicationProjectGoodsList();

describe('Get: ' + apiPath, () => {
  it('response success', async () => {
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValue(<Folder[]>Data.folder.list);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(ContentListService.prototype, 'getContentObjectByFileIds')
      .mockResolvedValue(<Record<string, Content>>Data.content.fileContentList);

    const result = await appInstance.index({
      applicationId: 'appl_yqfu8BI1BRe15fs',
      type: 'page',
      search: '',
    });
    expect(result.code).toEqual(200);
  });

  it('no file type goods', async () => {
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(ContentListService.prototype, 'getContentObjectByFileIds').mockResolvedValue({});

    const result = await appInstance.index({
      applicationId: 'appl_yqfu8BI1BRe15fs',
      type: 'page',
      search: '',
    });
    expect(result.code).toEqual(200);
  });

  it('no file content', async () => {
    jest.spyOn(FolderListService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValue(<File[]>Data.file.list);
    jest.spyOn(ContentListService.prototype, 'getContentObjectByFileIds').mockResolvedValue({});

    const result = await appInstance.index({
      applicationId: 'appl_yqfu8BI1BRe15fs',
      type: 'page',
      search: '',
    });
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderListService.prototype, 'find').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index({
      applicationId: 'appl_yqfu8BI1BRe15fs',
      type: 'page',
      search: '',
    });
    expect(result.code).toEqual(500);
  });
});
