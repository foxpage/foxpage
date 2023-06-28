import { Content } from '@foxpage/foxpage-server-types';

import { GetResourceVersionList } from '../../../../src/controllers/resources/get-resource-versions';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const resInstance = new GetResourceVersionList();

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  fileId: Data.file.id,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    fileId: Data.file.id,
  };
});

describe('Get: /resources/versions', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValue(<Content>Data.content.list[0]);
    jest.spyOn(VersionListService.prototype, 'getVersionList').mockResolvedValue(<any>[]);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response invalid id', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValue(<any>null);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
