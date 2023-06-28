import { GetResourceRemoteURL } from '../../../../src/controllers/resources/get-resource-remote-url';
import { ResourceService } from '../../../../src/services/resource-service';
import Data from '../../../data';

const resInstance = new GetResourceRemoteURL();

let params = {
  applicationId: Data.app.id,
  resourceType: '',
  resourceScope: '',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    resourceType: 'test type',
    resourceScope: 'application',
  };
});

describe('Post: /resources/groups', () => {
  it('response success', async () => {
    jest.spyOn(ResourceService.prototype, 'getResourceRemoteUrl').mockResolvedValue('');

    const result = await resInstance.index(params);
    expect(result.status).toEqual(1120601);
  });
  it('response error', async () => {
    jest.spyOn(ResourceService.prototype, 'getResourceRemoteUrl').mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.status).toEqual(3120601);
  });
});
