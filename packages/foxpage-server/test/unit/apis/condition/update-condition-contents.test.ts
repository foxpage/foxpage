import { Content } from '@foxpage/foxpage-server-types';

import { UpdateContentBaseDetail } from '../../../../src/controllers/conditions/update-condition-contents';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new UpdateContentBaseDetail();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  title: '',
  tags: [],
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    title: 'demo title',
    tags: [],
  };
});

describe('Put: /conditions/contents', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<Content>Data.content.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response empty data', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<Content>{});

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
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 1 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid content id type', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 2 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response content name exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'updateContentDetail').mockResolvedValueOnce({ code: 3 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'updateContentDetail')
      .mockRejectedValue(new Error('mock error'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
