import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { GetPageContentList } from '../../../../src/controllers/pages/get-page-contents';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentLogService } from '../../../../src/services/content-log-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageContentList();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  fileId: '',
  deleted: false,
  search: '',
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/content-searchs',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    fileId: Data.file.id,
    deleted: false,
    search: '',
  };
});

describe('Get: /pages/content-searchs', () => {
  it('response success', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(Data.file.list[0] as File);
    jest.spyOn(FileContentService.prototype, 'getFileContentList').mockResolvedValueOnce(Data.content.list);
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ContentLogService.prototype, 'getChangedContent').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1050701);
  });

  it('response invalid file ids', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue({} as File);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2050701);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3050701);
  });
});
