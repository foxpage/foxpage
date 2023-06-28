import { SaveRemoteResourceList } from '../../../../src/controllers/resources/batch-save-resources';
import { AuthService } from '../../../../src/services/authorization-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { ResourceService } from '../../../../src/services/resource-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const resInstance = new SaveRemoteResourceList();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  id: Data.folder.id,
  resources: [] as any[],
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };
  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    resources: [],
  };
});

describe('Post: /resources/groups', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(ResourceService.prototype, 'checkRemoteResourceExist').mockResolvedValue({ code: 0 });
    jest.spyOn(ResourceService.prototype, 'saveResources').mockReturnValue({} as any);
    jest.spyOn(FolderInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1120501);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(false);

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4120501);
  });
  it('response resource version exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest
      .spyOn(ResourceService.prototype, 'checkRemoteResourceExist')
      .mockResolvedValue({ code: 1, data: [] });

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120501);
  });

  it('response resource name exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest
      .spyOn(ResourceService.prototype, 'checkRemoteResourceExist')
      .mockResolvedValue({ code: 2, data: [] });

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2120502);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3120501);
  });
});
