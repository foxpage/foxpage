import _ from 'lodash';

import { ContentVersion, File } from '@foxpage/foxpage-server-types';

import { GetPageBuilderItemList } from '../../../../src/controllers/pages/get-page-builder-items';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageBuilderItemList();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  scope: '',
  type: '',
  search: '',
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/build-items',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    scope: 'application',
    type: 'page',
    search: '',
  };
});

describe('Post: /pages/build-items', () => {
  it('response success with app scope', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as File[]);
    jest.spyOn(ContentListService.prototype, 'getFileContentList').mockResolvedValueOnce({
      [Data.content.list[0].fileId]: [Data.content.list[0]],
    });
    jest
      .spyOn(VersionListService.prototype, 'getVersionListChunk')
      .mockResolvedValueOnce(Data.version.list as ContentVersion[]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052201);
  });

  it('response success with user scope', async () => {
    params.scope = 'user';
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(1);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as File[]);
    jest.spyOn(FileListService.prototype, 'getUserInvolveFiles').mockResolvedValueOnce({
      counts: 2,
      list: Data.file.list as File[],
    });
    jest.spyOn(ContentListService.prototype, 'getFileContentList').mockResolvedValueOnce({
      [Data.content.list[0].fileId]: [Data.content.list[0]],
    });
    jest
      .spyOn(VersionListService.prototype, 'getVersionListChunk')
      .mockResolvedValueOnce(Data.version.list as ContentVersion[]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052201);
  });

  it('response success with involve scope', async () => {
    params.scope = 'involve';
    jest.spyOn(FileListService.prototype, 'getUserInvolveFiles').mockResolvedValueOnce({
      counts: 2,
      list: Data.file.list as File[],
    });
    jest.spyOn(ContentListService.prototype, 'getFileContentList').mockResolvedValueOnce({
      [Data.content.list[0].fileId]: [Data.content.list[0]],
    });
    jest
      .spyOn(VersionListService.prototype, 'getVersionListChunk')
      .mockResolvedValueOnce(Data.version.list as ContentVersion[]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052201);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3052201);
  });
});
