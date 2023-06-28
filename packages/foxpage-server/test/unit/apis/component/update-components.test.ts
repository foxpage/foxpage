import { UpdateComponentFileDetail } from '../../../../src/controllers/components/update-components';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new UpdateComponentFileDetail();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  intro: '',
  componentType: 'react.component',
  loadOnIgnite: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    intro: '',
    componentType: 'react.component',
    loadOnIgnite: true,
  };
});

describe('Put: /components', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValue({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<any>Data.file.list[0]);
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(<any>Data.content.list);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(false);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(403);
  });

  it('response invalid content id', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockResolvedValue({ code: 1 });

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FileInfoService.prototype, 'updateFileDetail').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
