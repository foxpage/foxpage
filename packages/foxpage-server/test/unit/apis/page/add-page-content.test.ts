import _ from 'lodash';

import { AddPageContentDetail } from '../../../../src/controllers/pages/add-page-content';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddPageContentDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  fileId: '',
  title: '',
  isBase: false,
  extendId: '',
  tags: [] as any[],
  oneLocale: true,
  content: {},
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/contents',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    fileId: Data.file.id,
    title: 'test page title',
    isBase: true,
    extendId: Data.content.id,
    tags: [{ locale: 'en-US' }],
    oneLocale: true,
    content: {},
  };
});

describe('Post: /pages/contents', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(ContentInfoService.prototype, 'addContentDetail').mockResolvedValueOnce({} as never);
    jest.spyOn(ContentInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050101);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4050101);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3050101);
  });
});
