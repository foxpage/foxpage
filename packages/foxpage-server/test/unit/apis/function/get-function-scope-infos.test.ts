import _ from 'lodash';

import { Content, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { GetAppScopeFunctionList } from '../../../../src/controllers/functions/get-function-scope-infos';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import { ContentLiveVersion } from '../../../../src/types/content-types';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new GetAppScopeFunctionList();

let params: any = {};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: '',
    names: [],
    page: 1,
    size: 10,
    search: '',
  };
});

describe('Get: /functions/scope-infos', () => {
  it('response list', async () => {
    params.search = 'demo search';
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.list[0].id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest
      .spyOn(VersionNumberService.prototype, 'getContentMaxVersionByIds')
      .mockResolvedValue(Data.version.idVersionNumber);
    jest
      .spyOn(VersionListService.prototype, 'getContentByIdAndVersionNumber')
      .mockResolvedValue(<ContentVersion[]>Data.version.list);

    jest.spyOn(VersionListService.prototype, 'getVersionListRelations').mockResolvedValue({});
    jest
      .spyOn(ContentListService.prototype, 'getContentLiveInfoByIds')
      .mockResolvedValue(<ContentLiveVersion[]>Data.content.idLiveVersionNumber);

    jest
      .spyOn(FileListService.prototype, 'getContentFileByIds')
      .mockResolvedValue(_.keyBy(<File[]>Data.file.list, 'id'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response list with names', async () => {
    params.names = ['demo search'];
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.list[0].id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(<File[]>Data.file.list);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest
      .spyOn(VersionNumberService.prototype, 'getContentMaxVersionByIds')
      .mockResolvedValue(Data.version.idVersionNumber);
    jest
      .spyOn(VersionListService.prototype, 'getContentByIdAndVersionNumber')
      .mockResolvedValue(<ContentVersion[]>Data.version.list);

    jest.spyOn(VersionListService.prototype, 'getVersionListRelations').mockResolvedValue({});
    jest
      .spyOn(ContentListService.prototype, 'getContentLiveInfoByIds')
      .mockResolvedValue(<ContentLiveVersion[]>Data.content.idLiveVersionNumber);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response list with empty data', async () => {
    params.names = ['demo search'];
    jest
      .spyOn(FolderInfoService.prototype, 'getAppTypeFolderId')
      .mockResolvedValueOnce(Data.folder.list[0].id);
    jest.spyOn(FileListService.prototype, 'getFileListByFolderId').mockResolvedValue(<File[]>[]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(<Content[]>[]);
    jest.spyOn(VersionNumberService.prototype, 'getContentMaxVersionByIds').mockResolvedValue([]);
    jest
      .spyOn(VersionListService.prototype, 'getContentByIdAndVersionNumber')
      .mockResolvedValue(<ContentVersion[]>[]);

    jest.spyOn(VersionListService.prototype, 'getVersionListRelations').mockResolvedValue({});
    jest
      .spyOn(ContentListService.prototype, 'getContentLiveInfoByIds')
      .mockResolvedValue(<ContentLiveVersion[]>[]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
