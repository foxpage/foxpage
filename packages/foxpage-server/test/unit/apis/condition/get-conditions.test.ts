import { ContentVersion } from '@foxpage/foxpage-server-types';

import { GetAppConditionList } from '../../../../src/controllers/conditions/get-conditions';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new GetAppConditionList();

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
});

describe('Post: /conditions/lives', () => {
  it('response list', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValueOnce(<ContentVersion[]>Data.version.list);
    const result = await varInstance.index(<FoxCtx>ctx, { applicationId: Data.app.id, ids: [] });
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, { applicationId: Data.app.id, ids: [] });
    expect(result.code).toEqual(500);
  });
});
