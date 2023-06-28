import '../../../../../src/services/content-services/index';

import _ from 'lodash';

import { ContentModel } from '../../../../../src/models/content-model';
import { FileContentService } from '../../../../../src/services/content-services/file-content-service';
import { UserService } from '../../../../../src/services/user-service';
import Data from '../../../../data';

const appInstance = FileContentService.getInstance();
let params = {
  fileId: '',
  search: '',
  page: 1,
  size: 10,
};

beforeEach(() => {
  params = {
    fileId: Data.file.id,
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Service content/file/getFileContentList', () => {
  it('response success', async () => {
    jest.spyOn(ContentModel.prototype, 'getPageList').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.getFileContentList(params);
    expect(result.length).toBeGreaterThan(0);
  });

  it('response success', async () => {
    jest.spyOn(ContentModel.prototype, 'getPageList').mockResolvedValueOnce([]);

    const result = await appInstance.getFileContentList(params);
    expect(result.length).toEqual(0);
  });
});
