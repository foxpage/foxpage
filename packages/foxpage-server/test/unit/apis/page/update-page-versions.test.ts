import _ from 'lodash';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { UpdatePageVersionDetail } from '../../../../src/controllers/pages/update-page-versions';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentTagService } from '../../../../src/services/content-services/content-tag-service';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdatePageVersionDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  id: '',
  content: {} as any,
  version: '',
  pageContentId: '',
  contentUpdateTime: '',
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/versions',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    content: Data.version.list[0].content,
    version: '1',
    pageContentId: '',
    contentUpdateTime: '',
  };
});

describe('Put: /pages/versions', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 0 } as never);
    jest
      .spyOn(VersionInfoService.prototype, 'updateVersionDetail')
      .mockResolvedValueOnce({ code: 0, data: Data.version.id });
    jest.spyOn(ContentTagService.prototype, 'updateExtensionTag').mockResolvedValueOnce();
    jest
      .spyOn(VersionInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.version.list[0] as ContentVersion);
    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(RelationService.prototype, 'saveVersionRelations').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1051901);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4051901);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 1 } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051901);
  });

  it('response invalid relation format', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 2 } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051902);
  });

  it('response structure name', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 3 } as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051903);
  });

  it('response invalid version id', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 0 } as never);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 1 });
    jest.spyOn(ContentTagService.prototype, 'updateExtensionTag').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051904);
  });

  it('response unEdited status', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 0 } as never);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 2 });
    jest.spyOn(ContentTagService.prototype, 'updateExtensionTag').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051905);
  });

  it('response version exist', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 0 } as never);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 3 });
    jest.spyOn(ContentTagService.prototype, 'updateExtensionTag').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051906);
  });

  it('response missing fields', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 0 } as never);
    jest
      .spyOn(VersionInfoService.prototype, 'updateVersionDetail')
      .mockResolvedValueOnce({ code: 4, data: [] });
    jest.spyOn(ContentTagService.prototype, 'updateExtensionTag').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051907);
  });

  it('response content has update before', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(VersionCheckService.prototype, 'structure').mockReturnValueOnce({ code: 0 } as never);
    jest.spyOn(VersionInfoService.prototype, 'updateVersionDetail').mockResolvedValueOnce({ code: 5 });
    jest.spyOn(ContentTagService.prototype, 'updateExtensionTag').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2051908);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3051901);
  });
});
