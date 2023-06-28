import { ContentVersion, Folder } from '@foxpage/foxpage-server-types';

import { GetRemoteComponent } from '../../../../src/controllers/components/get-remote-component';
import { ComponentService } from '../../../../src/services/component-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { ResourceService } from '../../../../src/services/resource-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const comInstance = new GetRemoteComponent();

let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  groupId: 'fold_2L2JO29FjsH7k1d',
  name: 'container',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    groupId: 'fold_2L2JO29FjsH7k1d',
    name: 'seo',
  };
});

describe('Get: /components/remote', () => {
  it('response success', async () => {
    jest
      .spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion')
      .mockResolvedValue(Data.content.remoteResourceList);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest
      .spyOn(VersionListService.prototype, 'getMaxVersionByFileIds')
      .mockResolvedValue(<Record<string, ContentVersion>>{ [Data.file.id]: Data.version.list[0] });
    jest.spyOn(ComponentService.prototype, 'getComponentResourcePath').mockResolvedValue(<any>{});

    const result = await comInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response success with empty data', async () => {
    jest.spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion').mockResolvedValue([]);
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValue(<any>null);
    jest.spyOn(VersionListService.prototype, 'getMaxVersionByFileIds').mockResolvedValue({});
    jest.spyOn(ComponentService.prototype, 'getComponentResourcePath').mockResolvedValue(<any>{});

    const result = await comInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion')
      .mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
