import _ from 'lodash';

import { Content } from '@foxpage/foxpage-server-types';

import { SetPageContentStatus } from '../../../../src/controllers/pages/set-page-content-status';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { RelationService } from '../../../../src/services/relation-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new SetPageContentStatus();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  status: true,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/content-status',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    status: true,
  };
});

describe('Put: /pages/content-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);
    jest.spyOn(RelationService.prototype, 'removeVersionRelations').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051101);
  });

  it('response invalid content id', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as Content);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051101);
  });

  it('response has live version', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(
        Object.assign({}, Data.content.list[0] as Content, { liveVersionId: Data.version.id }),
      );

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051102);
  });

  it('response invalid content id 2', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 1 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051103);
  });

  it('response can not be deleted', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as Content);
    jest.spyOn(ContentInfoService.prototype, 'setContentDeleteStatus').mockResolvedValueOnce({ code: 2 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051104);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051101);
  });
});
