import _ from 'lodash';

import { AddFileDetail } from '../../../../src/controllers/files/add-files';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddFileDetail();
let ctx: Partial<FoxCtx> = {};
let params: any = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id,
    account: Data.user.account,
  };
  params = {
    applicationId: Data.app.id,
    name: 'test',
    type: 'page',
  };
});

describe('Post: /file/detail', () => {
  it('response success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValueOnce(null as any);
    jest.spyOn(FileInfoService.prototype, 'create').mockResolvedValueOnce(Data.file.list[0] as never);
    jest.spyOn(ContentInfoService.prototype, 'create').mockResolvedValueOnce(Data.content.list[0] as never);
    jest.spyOn(VersionInfoService.prototype, 'create').mockResolvedValueOnce(Data.version.list[0] as never);
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1170101);
  });

  it('response invalid name', async () => {
    params.name = 'test！121，';

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170101);
  });

  it('response invalid app', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValueOnce(null as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170102);
  });

  it('response name exist', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValueOnce(Data.file.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2170103);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    jest.spyOn(FileInfoService.prototype, 'getDetail').mockResolvedValueOnce(Data.file.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3170101);
  });
});
