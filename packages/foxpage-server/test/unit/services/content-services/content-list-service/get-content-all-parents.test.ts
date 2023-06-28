import '../../../../../src/services/content-services/index';

import { ContentListService } from '../../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../../src/services/file-services/file-list-service';
import { FolderListService } from '../../../../../src/services/folder-services/folder-list-service';
import Data from '../../../../data';

const appInstance = ContentListService.getInstance();
let params: any[] = [];

beforeEach(() => {
  params = [Data.component.versionList[0].contentId];
});

describe('Service content/component/getContentAllParents', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.component.contentList[0] as any]);
    jest
      .spyOn(FileListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.component.fileList[0] as any]);
    jest.spyOn(FolderListService.prototype, 'getAllParentsRecursive').mockResolvedValueOnce({
      ['fold_9T7UESc5Cc45UBk']: [Data.component.folderList[0]],
    });

    const result = await appInstance.getContentAllParents(params);
    expect(result['cont_kwVgKvYh552WPnH']).toBeDefined();
  });
});
