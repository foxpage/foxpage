import { Content } from '@foxpage/foxpage-server-types';

import { SetVariableContentStatus } from '../../../../src/controllers/variables/set-variable-content-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new SetVariableContentStatus();

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
});

describe('Put: /variables/content-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<Content>{});
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(403);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 1 });
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(400);
  });

  it('response content can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 2 });
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'setContentDeleteStatus')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, {
      applicationId: Data.app.id,
      id: Data.content.id,
      status: true,
    });
    expect(result.code).toEqual(500);
  });
});
