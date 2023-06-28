import { Folder } from '@foxpage/foxpage-server-types';

import { GetResourceGroupDetail } from '../../../../src/controllers/resources/get-groups';
import { ApplicationService } from '../../../../src/services/application-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import Data from '../../../data';

const resInstance = new GetResourceGroupDetail();

let params = {
  applicationId: Data.app.id,
  id: Data.folder.id,
  path: '/demo-path',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    path: '/demo-path',
  };
});

describe('Post: /resources/groups', () => {
  it('response invalid name or path', async () => {
    params.id = <any>undefined;
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(<any>null);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest
      .spyOn(ApplicationService.prototype, 'getAppResourceDetail')
      .mockResolvedValue(<any>Data.app.list[0].resources);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response success without id', async () => {
    params.id = <any>undefined;
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[1]);
    jest
      .spyOn(ApplicationService.prototype, 'getAppResourceDetail')
      .mockResolvedValue(<any>Data.app.list[0].resources);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response name or path must exist', async () => {
    params.id = <any>undefined;
    params.path = <any>undefined;

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
