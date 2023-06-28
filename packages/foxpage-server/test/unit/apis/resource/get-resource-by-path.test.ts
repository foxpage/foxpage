import { ContentVersion } from '@foxpage/foxpage-server-types';

import { GetResourceDetailByPath } from '../../../../src/controllers/resources/get-resource-by-path';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import { ResourceService } from '../../../../src/services/resource-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new GetResourceDetailByPath();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  path: '',
  depth: 5,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    path: '',
    depth: 5,
  };
});

describe('Get: /resources/by-paths', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<any>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getFolderIdByPathRecursive').mockResolvedValue(Data.folder.id);
    jest.spyOn(FolderListService.prototype, 'getAllChildrenRecursive').mockResolvedValue({});
    jest.spyOn(FileInfoService.prototype, 'getFileIdFromResourceRecursive').mockReturnValue([]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest
      .spyOn(VersionInfoService.prototype, 'find')
      .mockResolvedValue(<ContentVersion[]>Data.version.resourceList);
    jest
      .spyOn(FileInfoService.prototype, 'addContentToFileRecursive')
      .mockReturnValue(<any>{ folders: [{ id: Data.folder.id }] });
    jest
      .spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion')
      .mockResolvedValue(<any>[{ id: Data.folder.id }]);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response success with different parameter', async () => {
    params.depth = 0;
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<any>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getFolderIdByPathRecursive').mockResolvedValue(Data.folder.id);
    jest.spyOn(FolderListService.prototype, 'getAllChildrenRecursive').mockResolvedValue({});
    jest.spyOn(FileInfoService.prototype, 'getFileIdFromResourceRecursive').mockReturnValue([]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest
      .spyOn(VersionInfoService.prototype, 'find')
      .mockResolvedValue(<ContentVersion[]>[Data.version.resourceList[0], Data.version.list[0]]);
    jest
      .spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion')
      .mockResolvedValue(<any>[{ id: Data.folder.id }]);

    const result = await resInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
