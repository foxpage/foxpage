import { ContentVersion } from '@foxpage/foxpage-server-types';

import { GetAppComponentListInfos } from '../../../../src/controllers/components/get-component-list-infos';
import { ApplicationService } from '../../../../src/services/application-service';
import { ComponentService } from '../../../../src/services/component-service';
import { ComponentContentService } from '../../../../src/services/content-services/component-content-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ResourceContentService } from '../../../../src/services/content-services/resource-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new GetAppComponentListInfos();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  type: [],
  componentIds: [],
  search: '',
  loadOnIgnite: true,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    type: [],
    componentIds: [],
    search: '',
    loadOnIgnite: true,
  };
});

describe('Get: /components/edit-versions', () => {
  it('response success', async () => {
    jest
      .spyOn(ComponentContentService.prototype, 'getComponentVersionLiveDetails')
      .mockResolvedValue(<any>Data.content.nameVersionComponent);
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockResolvedValue({});
    jest
      .spyOn(ComponentService.prototype, 'getComponentDetailByIdVersion')
      .mockResolvedValue(<Record<string, ContentVersion>>{ id: Data.version.list[0] });
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest.spyOn(ApplicationService.prototype, 'getAppResourceFromContent').mockResolvedValue([]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response success with diff parameter', async () => {
    params.type = <any>undefined;
    jest
      .spyOn(ComponentContentService.prototype, 'getComponentVersionLiveDetails')
      .mockResolvedValue(<any>Data.content.nameVersionComponent);
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockResolvedValue({});
    jest
      .spyOn(ComponentService.prototype, 'getComponentDetailByIdVersion')
      .mockResolvedValue(<Record<string, ContentVersion>>{ id: Data.version.list[0] });
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest.spyOn(ApplicationService.prototype, 'getAppResourceFromContent').mockResolvedValue([]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ComponentContentService.prototype, 'getComponentVersionLiveDetails')
      .mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
