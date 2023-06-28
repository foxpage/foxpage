import { ContentVersion, File } from '@foxpage/foxpage-server-types';

import { SaveRemoteComponents } from '../../../../src/controllers/components/batch-save-components';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { ResourceService } from '../../../../src/services/resource-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new SaveRemoteComponents();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  components: <any>Data.content.newComponentList,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    components: <any>Data.content.newComponentList,
  };
});

describe('Get: /components/remote', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(ContentListService.prototype, 'getContentObjectByFileIds').mockResolvedValue({});
    jest.spyOn(ResourceService.prototype, 'checkRemoteResourceExist').mockResolvedValue({ code: 0 });
    jest.spyOn(ResourceService.prototype, 'saveResources').mockReturnValueOnce({});
    jest.spyOn(ContentInfoService.prototype, 'create').mockReturnValueOnce(<any>{});
    jest.spyOn(VersionInfoService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(VersionInfoService.prototype, 'create').mockReturnValueOnce(<any>{});
    jest.spyOn(FileInfoService.prototype, 'create').mockReturnValueOnce(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'updateDetailQuery').mockReturnValueOnce(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response success with replace exist data', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(ContentListService.prototype, 'getContentObjectByFileIds').mockResolvedValue({});
    jest.spyOn(ResourceService.prototype, 'checkRemoteResourceExist').mockResolvedValue({ code: 1 });
    jest.spyOn(ResourceService.prototype, 'saveResources').mockReturnValueOnce({});
    jest.spyOn(ContentInfoService.prototype, 'create').mockReturnValueOnce(<any>{});
    jest.spyOn(VersionInfoService.prototype, 'find').mockResolvedValue([]);
    jest.spyOn(VersionInfoService.prototype, 'create').mockReturnValueOnce(<any>{});
    jest.spyOn(FileInfoService.prototype, 'create').mockReturnValueOnce(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'updateDetailQuery').mockReturnValueOnce(<File>Data.file.list[0]);
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValue();

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response version exist', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest.spyOn(ContentListService.prototype, 'getContentObjectByFileIds').mockResolvedValue({});
    jest.spyOn(ResourceService.prototype, 'checkRemoteResourceExist').mockResolvedValue({ code: 1 });
    jest.spyOn(ResourceService.prototype, 'saveResources').mockReturnValueOnce({});
    jest.spyOn(ContentInfoService.prototype, 'create').mockReturnValueOnce(<any>{});
    jest.spyOn(VersionInfoService.prototype, 'find').mockResolvedValue(<ContentVersion[]>Data.version.list);
    jest.spyOn(FileInfoService.prototype, 'create').mockReturnValueOnce(<File>Data.file.list[0]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValue(true);
    jest
      .spyOn(ContentListService.prototype, 'getContentObjectByFileIds')
      .mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
