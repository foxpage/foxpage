import _ from 'lodash';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { GetComponentVersionDetail } from '../../../../src/controllers/components/get-component-version';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ResourceContentService } from '../../../../src/services/content-services/resource-content-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import Data from '../../../data';

const comInstance = new GetComponentVersionDetail();

let params = {
  applicationId: Data.app.id,
  id: Data.file.id,
  versionNumber: 1,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.file.id,
    versionNumber: 1,
  };
});

describe('Get: /components/version-searchs', () => {
  it('response success', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(<Content>Data.content.list[0]);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.componentList[0]);
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest.spyOn(ApplicationService.prototype, 'getAppResourceFromContent').mockResolvedValue([]);

    const result = await comInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response success with empty data', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(<Content>Data.content.list[0]);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest.spyOn(ApplicationService.prototype, 'getAppResourceFromContent').mockResolvedValue([]);

    const result = await comInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response invalid file id', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);

    const result = await comInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
