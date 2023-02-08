import _ from 'lodash';

import { GetFileAllParentList } from '../../../../src/controllers/files/get-file-parents';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderListService } from '../../../../src/services/folder-services/folder-list-service';
// import { LogService } from '../../../../src/services/log-service';
import { UserService } from '../../../../src/services/user-service';
// import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import Data from '../../../data';

const appInstance = new GetFileAllParentList();
let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
  };
});

describe('Get: /files/parents', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailObjectByIds')
      .mockResolvedValueOnce({ [Data.app.list[0].id]: Data.app.list[0] });
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValueOnce({});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170201);
  });

  it('response success with content id', async () => {
    params.id = Data.content.id;
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as any);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailObjectByIds')
      .mockResolvedValueOnce({ [Data.app.list[0].id]: Data.app.list[0] });
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValueOnce({});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170201);
  });

  it('response success with file id', async () => {
    params.id = Data.file.id;
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.file.list[0] as any);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailObjectByIds')
      .mockResolvedValueOnce({ [Data.app.list[0].id]: Data.app.list[0] });
    jest
      .spyOn(ApplicationService.prototype, 'getDetailObjectByIds')
      .mockResolvedValueOnce({ [Data.app.list[0].id]: Data.app.list[0] });
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValueOnce({});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170201);
  });

  it('response success with folder id', async () => {
    params.id = Data.folder.id;
    jest
      .spyOn(FolderListService.prototype, 'getAllParentsRecursive')
      .mockResolvedValueOnce({ [params.id]: [Data.folder.list[0]] } as any);
    jest
      .spyOn(ApplicationService.prototype, 'getDetailObjectByIds')
      .mockResolvedValueOnce({ [Data.app.list[0].id]: Data.app.list[0] });
    jest.spyOn(UserService.prototype, 'getUserBaseObjectByIds').mockResolvedValueOnce({});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170201);
  });

  it('response success with empty data', async () => {
    params.id = '';

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1170201);
  });

  it('response error', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3170201);
  });
});
