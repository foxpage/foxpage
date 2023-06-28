// import { Folder } from '@foxpage/foxpage-server-types';

import { GetRemoteResourceList } from '../../../../src/controllers/resources/get-remote-resources';
import { ResourceService } from '../../../../src/services/resource-service';
import Data from '../../../data';

const resInstance = new GetRemoteResourceList();

let params = {
  applicationId: Data.app.id,
  id: Data.folder.id,
  name: '',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.folder.id,
    name: 'demo name',
  };
});

describe('Get: /resources/remote', () => {
  it('response success', async () => {
    jest.spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion').mockResolvedValue([]);

    const result = await resInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response success with empty name', async () => {
    params.name = <any>undefined;
    jest.spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion').mockResolvedValue([]);

    const result = await resInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ResourceService.prototype, 'getResourceGroupLatestVersion')
      .mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
