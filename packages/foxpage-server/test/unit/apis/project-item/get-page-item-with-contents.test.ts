import _ from 'lodash';

import { File } from '@foxpage/foxpage-server-types';

import { GetPageProjectItemListWithContents } from '../../../../src/controllers/project-items/get-page-item-with-contents';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetPageProjectItemListWithContents();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  projectId: '',
  search: '',
  page: 1,
  size: 10,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/page-content/search',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    projectId: Data.folder.id,
    search: 'test',
    page: 1,
    size: 10,
  };
});

describe('Get: /page-content/search', () => {
  it('response success', async () => {
    jest.spyOn(FileListService.prototype, 'getCount').mockResolvedValueOnce(2);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>Data.file.list);
    jest.spyOn(ContentListService.prototype, 'find').mockResolvedValueOnce(Data.content.list);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1200101);
  });

  it('response error', async () => {
    jest.spyOn(FileListService.prototype, 'getCount').mockRejectedValue(new Error('mock error'));
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3200101);
  });
});
