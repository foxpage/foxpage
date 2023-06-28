import _ from 'lodash';

import { AddMockDetail } from '../../../../src/controllers/mocks/add-mocks';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddMockDetail();

let params: any = {};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    name: 'test mock',
    intro: '',
    folderId: Data.folder.id,
    pageContentId: '',
    type: 'mock',
    subType: '',
    suffix: '',
    content: {},
  };
});

describe('Post: /mocks', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValue('');
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValue({ code: 0 });

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4190101);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
