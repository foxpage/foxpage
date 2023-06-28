import { File } from '@foxpage/foxpage-server-types';

import { GetContentByIds } from '../../../../src/controllers/contents/get-contents-by-ids';
// import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const conInstance = new GetContentByIds();

let params = {
  applicationId: Data.app.id,
  contentIds: [],
};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    contentIds: [],
  };
});

describe('Post: /contents', () => {
  it('response success', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.content.list);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailByIds').mockRejectedValue(new Error('mock error'));

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
