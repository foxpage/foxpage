import _ from 'lodash';

import { ContentVersion, File } from '@foxpage/foxpage-server-types';

import { GetAppComponentList } from '../../../../src/controllers/components/get-component-list';
import { ApplicationService } from '../../../../src/services/application-service';
import { ComponentService } from '../../../../src/services/component-service';
import { ComponentContentService } from '../../../../src/services/content-services/component-content-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ResourceContentService } from '../../../../src/services/content-services/resource-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new GetAppComponentList();
let ctx: Partial<FoxCtx> = {};

let params = {
  applicationId: Data.app.id,
  type: ['component'],
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
    type: ['component'],
    componentIds: [],
    search: '',
    loadOnIgnite: true,
  };
});

describe('Get: /components/live-versions', () => {
  it('response success', async () => {
    jest
      .spyOn(ComponentContentService.prototype, 'getComponentVersionLiveDetails')
      .mockResolvedValue(<any>Data.content.nameVersionComponent);
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockResolvedValue(<Record<string, File>>{
      // eslint-disable-next-line camelcase
      cont_X3oHESmT7lQebHz: Object.assign(Data.file.list[0], { type: 'component' }),
    });
    jest.spyOn(ComponentService.prototype, 'getComponentDetailByIdVersion').mockResolvedValue(<
      Record<string, ContentVersion>
    >{
      // eslint-disable-next-line camelcase
      cont_X3oHESmT7lQebHz: Object.assign(Data.version.list[0], { contentId: 'cont_X3oHESmT7lQebHz' }),
    });
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest.spyOn(ApplicationService.prototype, 'getAppResourceFromContent').mockResolvedValue([]);

    const result = await comInstance.index(<FoxCtx>ctx, params);

    expect(result.code).toEqual(200);
  });

  it('response success with different parameter', async () => {
    params.type = <any>undefined;
    jest
      .spyOn(ComponentContentService.prototype, 'getComponentVersionLiveDetails')
      .mockResolvedValue(<any>Data.content.nameVersionComponent);
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockResolvedValue(<Record<string, File>>{
      // eslint-disable-next-line camelcase
      cont_X3oHESmT7lQebHz: Object.assign(Data.file.list[0], { type: 'component' }),
    });
    jest.spyOn(ComponentService.prototype, 'getComponentDetailByIdVersion').mockResolvedValue(<
      Record<string, ContentVersion>
    >{
      // eslint-disable-next-line camelcase
      cont_X3oHESmT7lQebHz: Object.assign(Data.version.list[0], { contentId: 'cont_X3oHESmT7lQebHz' }),
    });
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
