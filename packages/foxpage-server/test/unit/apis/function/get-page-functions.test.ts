import { Content, File, Folder } from '@foxpage/foxpage-server-types';

import { GetPageFunctionList } from '../../../../src/controllers/functions/get-page-functions';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const varInstance = new GetPageFunctionList();

let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.folder.list[0].applicationId,
    folderId: 'fold_pOginfBEFU2Rrlb',
    type: '',
    page: 1,
    size: 10,
    search: '',
  };
});

describe('Get: /function-searchs', () => {
  it('response list', async () => {
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<Folder>Data.folder.list[0]);
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.list[0].id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest.spyOn(VersionListService.prototype, 'getContentMaxVersionDetail').mockResolvedValue({});
    jest.spyOn(VersionListService.prototype, 'getVersionListRelations').mockResolvedValue({});
    jest.spyOn(RelationService.prototype, 'formatRelationDetailResponse').mockResolvedValue({});

    const result = await varInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response list with different app folderId', async () => {
    params.type = 'project';
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<Folder>Data.folder.list[0]);
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.list[1].id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest.spyOn(VersionListService.prototype, 'getContentMaxVersionDetail').mockResolvedValue({});
    jest.spyOn(VersionListService.prototype, 'getVersionListRelations').mockResolvedValue({});
    jest.spyOn(RelationService.prototype, 'formatRelationDetailResponse').mockResolvedValue({});

    const result = await varInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response list with empty data', async () => {
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<Folder>Data.folder.list[0]);
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.list[1].id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue([]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue([]);
    jest.spyOn(VersionListService.prototype, 'getContentMaxVersionDetail').mockResolvedValue({});
    jest.spyOn(VersionListService.prototype, 'getVersionListRelations').mockResolvedValue({});
    jest.spyOn(RelationService.prototype, 'formatRelationDetailResponse').mockResolvedValue({});

    const result = await varInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('invalid folder id', async () => {
    params.applicationId = Data.app.id;

    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<any>null);
    const result = await varInstance.index(params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
