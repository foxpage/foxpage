import { Folder } from '@foxpage/foxpage-server-types';

import { GetResourceDetail } from '../../../../src/controllers/resources/get-resources';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
import Data from '../../../data';

const resInstance = new GetResourceDetail();

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  name: '',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    name: '',
  };
});

describe('Get: /resources', () => {
  it('response success', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getAppDefaultFolderIds').mockResolvedValue(<any>null);
    jest.spyOn(FolderInfoService.prototype, 'find').mockResolvedValue(<Folder[]>Data.folder.list);
    jest.spyOn(FolderListService.prototype, 'getAllChildrenRecursive').mockResolvedValue({});

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response success with empty id', async () => {
    params.id = <any>undefined;
    params.name = 'demo';
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getAppDefaultFolderIds').mockResolvedValue(new Set(['id']));
    jest.spyOn(FolderInfoService.prototype, 'find').mockResolvedValue(<Folder[]>Data.folder.list);
    jest.spyOn(FolderListService.prototype, 'getAllChildrenRecursive').mockResolvedValue({});

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    params.id = <any>undefined;
    params.name = 'demo';
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getAppDefaultFolderIds').mockResolvedValue(new Set(['id']));
    jest.spyOn(FolderInfoService.prototype, 'find').mockResolvedValue([]);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response missing resource folder', async () => {
    params.id = <any>undefined;
    params.name = 'demo';
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockResolvedValue(<Folder>Data.folder.list[0]);
    jest.spyOn(FolderInfoService.prototype, 'getAppDefaultFolderIds').mockResolvedValue(new Set());

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response invalid id and name', async () => {
    params.id = <any>undefined;
    params.name = <any>undefined;
    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
