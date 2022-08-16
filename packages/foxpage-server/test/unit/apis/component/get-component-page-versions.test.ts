import _ from 'lodash';

import { Content, File } from '@foxpage/foxpage-server-types';

import { GetComponentPageVersionList } from '../../../../src/controllers/components/get-component-page-versions';
import { ApplicationService } from '../../../../src/services/application-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { ResourceContentService } from '../../../../src/services/content-services/resource-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import { ContentVersionInfo } from '../../../../src/types/content-types';
import Data from '../../../data';

const comInstance = new GetComponentPageVersionList();

let params = {
  applicationId: Data.app.id,
  id: '',
  type: '',
  search: '',
  page: 1,
  size: 10,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: '',
    type: '',
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Get: /components/version-searchs', () => {
  it('response success', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(<Content>Data.content.list[0]);
    jest
      .spyOn(VersionListService.prototype, 'getVersionList')
      .mockResolvedValue(<ContentVersionInfo[]>Data.version.list);
    jest.spyOn(ResourceContentService.prototype, 'getResourceContentByIds').mockResolvedValue({});
    jest.spyOn(ContentListService.prototype, 'getContentAllParents').mockResolvedValue({});
    jest.spyOn(ApplicationService.prototype, 'getAppResourceFromContent').mockResolvedValue([]);

    const result = await comInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response invalid file id', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValue(<File>Data.file.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);

    const result = await comInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
