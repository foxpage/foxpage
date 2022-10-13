import { Content } from '@foxpage/foxpage-server-types';

import { SetConditionLiveVersions } from '../../../../src/controllers/conditions/set-condition-version-live';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new SetConditionLiveVersions();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  versionNumber: 1,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    versionNumber: 1,
  };
});

describe('Put: /conditions/live-versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentLiveService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(ContentLiveService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentLiveService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(ContentLiveService.prototype, 'getDetailById').mockResolvedValueOnce(<Content>{});
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(403);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 1 });
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response content can not be set live', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 2 });
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response content relation info not exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValueOnce({ code: 3, data: '{"code":3,"data":[]}' });
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response content relation depend is recursive', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValueOnce({ code: 3, data: '{"code":4}' });
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
