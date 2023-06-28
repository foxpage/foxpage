import '../../../../../src/services/content-services/index';

import { ContentListService } from '../../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../../src/services/file-services/file-list-service';
import Data from '../../../../data';

const appInstance = FileListService.getInstance();
let params: any[] = [];

beforeEach(() => {
  params = [Data.component.versionList[0].contentId];
});

describe('Service file/list/getContentFileByIds', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.component.contentList[0] as any]);
    jest
      .spyOn(ContentListService.prototype, 'setContentReferenceFileId')
      .mockResolvedValueOnce([Data.component.contentList[0] as any]);
    jest
      .spyOn(FileListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.component.fileList[0] as any]);

    const result = await appInstance.getContentFileByIds(params);
    expect(result['cont_kwVgKvYh552WPnH']).toBeDefined();
  });

  it('response success with application id', async () => {
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.component.contentList[0] as any]);
    jest
      .spyOn(ContentListService.prototype, 'setContentReferenceFileId')
      .mockResolvedValueOnce([Data.component.contentList[0] as any]);
    jest
      .spyOn(FileListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.component.fileList[0] as any]);

    const result = await appInstance.getContentFileByIds(params, Data.component.contentList[0].applicationId);
    expect(result['cont_kwVgKvYh552WPnH']).toBeDefined();
  });

  it('response success response empty', async () => {
    const result = await appInstance.getContentFileByIds([]);
    expect(result).toStrictEqual({});
  });
});
