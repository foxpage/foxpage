import _ from 'lodash';

import { GetAppPageBuildInfoList } from '../../../../src/controllers/pages/get-page-build-with-relations';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ContentMockService } from '../../../../src/services/content-services/content-mock-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetAppPageBuildInfoList();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  ids: [] as string[],
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/draft-infos',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    ids: [Data.content.id],
  };
});

describe('Post: /pages/draft-infos', () => {
  it('response success', async () => {
    jest
      .spyOn(FileListService.prototype, 'getContentFileByIds')
      .mockResolvedValueOnce({ [Data.file.id]: Data.file.list[0] } as any);
    jest
      .spyOn(VersionLiveService.prototype, 'getContentAndRelationVersion')
      .mockResolvedValueOnce([Data.content.contentAndRelationVersion] as any[]);
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.content.list);
    jest.spyOn(ContentMockService.prototype, 'getMockBuildVersions').mockResolvedValueOnce({});
    jest.spyOn(ContentMockService.prototype, 'getMockLiveVersions').mockResolvedValueOnce({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050501);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3050503);
  });
});
