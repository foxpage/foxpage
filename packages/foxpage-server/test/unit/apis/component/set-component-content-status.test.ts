import { SetComponentContentStatus } from '../../../../src/controllers/components/set-component-content-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new SetComponentContentStatus();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  status: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

describe('Put: /components/content-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValue({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(Data.content.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValue({ code: 1 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response content can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValue({ code: 2 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'setContentDeleteStatus')
      .mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
