import { GetApplicationPageList } from '../../../../src/controllers/applications/get-page-applications';
import { ApplicationService } from '../../../../src/services/application-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetApplicationPageList();
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
});

const params = { organizationId: Data.org.id, type: '', search: '' };

describe('Post: /application-searchs', () => {
  it('response list', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getPageList')
      .mockResolvedValueOnce({ total: 1, appList: Data.app.list });
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getPageList').mockRejectedValue(new Error('mock error'));
    params.search = 'demo';
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
