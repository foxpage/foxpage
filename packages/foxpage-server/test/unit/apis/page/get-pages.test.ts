import _ from 'lodash';

import { GetPageLivesList } from '../../../../src/controllers/pages/get-pages';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { ContentMockService } from '../../../../src/services/content-services/content-mock-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageLivesList();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: 'pages/lives',
  };
  params = {
    applicationId: Data.app.id,
    ids: [Data.content.id],
  };
});

describe('Post: /pages/lives', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValueOnce(Data.version.list as any[]);
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(ContentMockService.prototype, 'getMockLiveVersions')
      .mockResolvedValueOnce(Data.content.mockLiveVersion as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051001);
  });
});

describe('Post: /pages/lives', () => {
  it('response success 2', async () => {
    jest.spyOn(ContentLiveService.prototype, 'getContentLiveDetails').mockResolvedValueOnce([]);
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce([]);
    jest.spyOn(ContentMockService.prototype, 'getMockLiveVersions').mockResolvedValueOnce({});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051001);
  });
});

describe('Post: /pages/lives', () => {
  it('response error', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3051001);
  });
});
