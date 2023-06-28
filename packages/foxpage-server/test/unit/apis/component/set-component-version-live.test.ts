import { SetComponentLiveVersions } from '../../../../src/controllers/components/set-component-version-live';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new SetComponentLiveVersions();
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
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    versionNumber: 1,
  };
});

describe('Put: /components/live-versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValue({ code: 0 });
    jest.spyOn(ContentLiveService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(<any>Data.file.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValue({ code: 1 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response version no has release version', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValue({ code: 2 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response component info not exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValue({ code: 3, data: '{"code":1,"data":[]}' });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response component has recursive depends', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValue({ code: 3, data: '{"code":2,"data":[]}' });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
