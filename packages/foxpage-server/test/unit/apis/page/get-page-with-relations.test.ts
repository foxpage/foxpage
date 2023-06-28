import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { GetAppPageLiveInfoList } from '../../../../src/controllers/pages/get-page-with-relations';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ContentMockService } from '../../../../src/services/content-services/content-mock-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetAppPageLiveInfoList();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  params = {
    applicationId: Data.app.id,
    ids: [Data.content.id],
  };
});

describe('Post: /pages/live-infos', () => {
  it('response success', async () => {
    jest
      .spyOn(FileListService.prototype, 'getContentFileByIds')
      .mockResolvedValueOnce(Data.content.contentFileObject as Record<string, File>);
    jest
      .spyOn(VersionLiveService.prototype, 'getContentAndRelationVersion')
      .mockResolvedValueOnce(Data.content.contentAndRelationVersion as any[]);
    jest.spyOn(ContentMockService.prototype, 'getMockLiveVersions').mockResolvedValueOnce({});
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050901);
  });

  it('response success with empty ids', async () => {
    params.ids = [];

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050901);
  });

  it('response depend missing', async () => {
    const contentAndRelationVersion = _.cloneDeep(Data.content.contentAndRelationVersion);
    contentAndRelationVersion[0].dependMissing = ['cont_xxxx'] as any;
    jest
      .spyOn(FileListService.prototype, 'getContentFileByIds')
      .mockResolvedValueOnce(Data.content.contentFileObject as Record<string, File>);
    jest
      .spyOn(VersionLiveService.prototype, 'getContentAndRelationVersion')
      .mockResolvedValueOnce(contentAndRelationVersion as any[]);
    jest.spyOn(ContentMockService.prototype, 'getMockLiveVersions').mockResolvedValueOnce({});
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3050901);
  });

  it('response depend missing', async () => {
    const contentAndRelationVersion = _.cloneDeep(Data.content.contentAndRelationVersion);
    contentAndRelationVersion[0].recursiveItem = 'variableA';
    contentAndRelationVersion[0].relations = {} as any;
    jest
      .spyOn(FileListService.prototype, 'getContentFileByIds')
      .mockResolvedValueOnce(Data.content.contentFileObject as Record<string, File>);
    jest
      .spyOn(VersionLiveService.prototype, 'getContentAndRelationVersion')
      .mockResolvedValueOnce(contentAndRelationVersion as any[]);
    jest.spyOn(ContentMockService.prototype, 'getMockLiveVersions').mockResolvedValueOnce({});
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3050902);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3050903);
  });
});
