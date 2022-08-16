import { GetAllApplicationPageList } from '../../../../src/controllers/applications/get-all-page-applications';
import { ApplicationService } from '../../../../src/services/application-service';
import Data from '../../../data';

const apiPath = '/applications-all-searchs';
const appInstance = new GetAllApplicationPageList();

describe('Get: ' + apiPath, () => {
  it('response success', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getPageListWithOrgInfo')
      .mockResolvedValue({ data: Data.app.appWithOrgList, pageInfo: { page: 1, size: 1, total: 1 } });
    const result = await appInstance.index({});
    expect(result.code).toEqual(200);
  });

  it('response success with search', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getPageListWithOrgInfo')
      .mockResolvedValue({ data: Data.app.appWithOrgList, pageInfo: { page: 1, size: 1, total: 1 } });
    const result = await appInstance.index({ search: 'demo app' });
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getPageListWithOrgInfo')
      .mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index({});
    expect(result.code).toEqual(500);
  });
});
