import _ from 'lodash';

import { GetAppScopeMockList } from '../../../../src/controllers/mocks/get-mock-scope-infos';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetAppScopeMockList();

let params: any = {};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    names: ['test mock'],
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Post: /mocks', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue('');
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(Data.file.list as any[]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest
      .spyOn(VersionNumberService.prototype, 'getContentMaxVersionByIds')
      .mockResolvedValue([{ _id: '', versionNumber: 1 }]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
