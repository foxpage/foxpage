import { ContentVersion, File, Resources } from '@foxpage/foxpage-server-types';

import { GetAppComponentListByNameVersion } from '../../../../src/controllers/components/get-component-by-name-versions';
import { ApplicationService } from '../../../../src/services/application-service';
import { ComponentService } from '../../../../src/services/component-service';
import { ComponentContentService } from '../../../../src/services/content-services/component-content-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ResourceContentService } from '../../../../src/services/content-services/resource-content-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { VersionComponentService } from '../../../../src/services/version-services/version-component-service';
import { ComponentContentInfo } from '../../../../src/types/component-types';
import { NameVersionPackage } from '../../../../src/types/content-types';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const comInstance = new GetAppComponentListByNameVersion();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  nameVersions: [{ version: '', name: '@fox-design/react-slot' }],
  type: ['component'],
  isCanary: false,
};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '',
  };

  params = {
    applicationId: Data.app.id,
    nameVersions: [{ version: '', name: '@fox-design/react-slot' }],
    type: ['component'],
    isCanary: false,
  };
});

describe('Get: /components/version-infos', () => {
  it('response success', async () => {
    jest
      .spyOn(ComponentContentService.prototype, 'getAppComponentByNameVersion')
      .mockResolvedValue(<NameVersionPackage[]>Data.content.nameVersionComponent);
    jest.spyOn(ComponentContentService.prototype, 'getComponentResourceIds').mockReturnValueOnce([]);
    // jest
    //   .spyOn(ComponentService.prototype, 'getComponentEditorAndDependends')
    //   .mockReturnValueOnce(<IdVersion[]>Data.content.idVersions);
    jest
      .spyOn(ComponentService.prototype, 'getComponentDetailByIdVersion')
      .mockResolvedValue(<Record<string, ContentVersion>>{ versionKey: Data.version.list[0] });
    jest.spyOn(ComponentContentService.prototype, 'getComponentResourceIds').mockReturnValueOnce([]);
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest
      .spyOn(ApplicationService.prototype, 'getAppResourceFromContent')
      .mockResolvedValue(Data.app.list[0].resources);
    jest.spyOn(ContentInfoService.prototype, 'getContentResourceTypeInfo').mockReturnValueOnce({});
    jest
      .spyOn(VersionComponentService.prototype, 'assignResourceToComponent')
      .mockReturnValueOnce(<Resources>{});
    jest.spyOn(FileListService.prototype, 'getContentFileByIds').mockResolvedValue(<Record<string, File>>{
      // eslint-disable-next-line camelcase
      cont_cuREMD9zcUZEcVU: Object.assign(Data.file.list[0], { type: 'component' }),
    });
    jest
      .spyOn(ComponentService.prototype, 'addNameToEditorAndDepends')
      .mockReturnValueOnce(<ComponentContentInfo[]>[]);

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response success with diff param type', async () => {
    params.type = ['editor'];
    jest
      .spyOn(ComponentContentService.prototype, 'getAppComponentByNameVersion')
      .mockResolvedValue(<NameVersionPackage[]>Data.content.nameVersionComponent);
    jest.spyOn(ComponentContentService.prototype, 'getComponentResourceIds').mockReturnValueOnce([]);
    // jest
    //   .spyOn(ComponentService.prototype, 'getComponentEditorAndDependends')
    //   .mockReturnValueOnce(<IdVersion[]>Data.content.idVersions);
    jest
      .spyOn(ComponentService.prototype, 'getComponentDetailByIdVersion')
      .mockResolvedValue(<Record<string, ContentVersion>>{ versionKey: Data.version.list[0] });
    jest.spyOn(ComponentContentService.prototype, 'getComponentResourceIds').mockReturnValueOnce([]);
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest
      .spyOn(ApplicationService.prototype, 'getAppResourceFromContent')
      .mockResolvedValue(Data.app.list[0].resources);
    jest.spyOn(ContentInfoService.prototype, 'getContentResourceTypeInfo').mockReturnValueOnce({});
    jest
      .spyOn(VersionComponentService.prototype, 'assignResourceToComponent')
      .mockReturnValueOnce(<Resources>{});
    jest
      .spyOn(FileListService.prototype, 'getContentFileByIds')
      // eslint-disable-next-line camelcase
      .mockResolvedValue(<Record<string, File>>{ cont_cuREMD9zcUZEcVU: Data.file.list[0] });
    jest
      .spyOn(ComponentService.prototype, 'addNameToEditorAndDepends')
      .mockReturnValueOnce(<ComponentContentInfo[]>[]);

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ComponentContentService.prototype, 'getAppComponentByNameVersion')
      .mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
