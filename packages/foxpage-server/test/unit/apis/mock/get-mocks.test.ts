import _ from 'lodash';

import { GetMockList } from '../../../../src/controllers/mocks/get-mocks';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetMockList();

let params: any = {};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    name: 'test mock',
    intro: '',
    folderId: Data.folder.id,
    pageContentId: '',
    type: 'mock',
    subType: '',
    suffix: '',
    content: {},
  };
});

describe('Post: /mocks', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValueOnce(Data.version.list as any[]);
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.content.list as any[]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockRejectedValue(new Error('mock error'));
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.content.list as any[]);
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(500);
  });
});
