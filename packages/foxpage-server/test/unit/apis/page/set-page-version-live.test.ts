import _ from 'lodash';

import { SetPageLiveVersions } from '../../../../src/controllers/pages/set-page-version-live';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageLiveVersions();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  versionNumber: 1,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/live-versions',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    versionNumber: 1,
  };
});

describe('Put: /pages/live-versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 0 } as never);
    jest.spyOn(ContentLiveService.prototype, 'runTransaction').mockResolvedValueOnce({} as any);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051401);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051401);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 1 } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051401);
  });

  it('response version is not release', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 2 } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051402);
  });

  it('response component info not exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValueOnce({ code: 3, data: JSON.stringify({ code: 1, data: [] }) } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051403);
  });

  it('response component depend recursive', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValueOnce({ code: 3, data: JSON.stringify({ code: 2 }) } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051404);
  });

  it('response relation not exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValueOnce({ code: 3, data: JSON.stringify({ code: 3, data: [] }) } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051405);
  });

  it('response relation depend recursive', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentLiveService.prototype, 'setLiveVersion')
      .mockResolvedValueOnce({ code: 3, data: JSON.stringify({ code: 4 }) } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051406);
  });

  it('response invalid version content', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(ContentLiveService.prototype, 'setLiveVersion').mockResolvedValueOnce({ code: 4 } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051407);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051401);
  });
});
