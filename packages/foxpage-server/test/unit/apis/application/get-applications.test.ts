import { GetApplicationList } from '../../../../src/controllers/applications/get-applications';
import { ApplicationService } from '../../../../src/services/application-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetApplicationList();
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
});

describe('Post: /applications/list', () => {
  it('response list', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.app.list);
    const result = await appInstance.index(<FoxCtx>ctx, { applicationIds: [Data.app.id] });
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailByIds').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, { applicationIds: [Data.app.id] });
    expect(result.code).toEqual(500);
  });
});
