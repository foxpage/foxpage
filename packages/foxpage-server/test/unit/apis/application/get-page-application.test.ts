import { GetApplicationPageList } from '../../../../src/controllers/applications/get-page-applications';
import { ApplicationService } from '../../../../src/services/application-service';
import Data from '../../../data';

const appInstance = new GetApplicationPageList();

describe('Post: /application-searchs', () => {
  it('response list', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getPageList')
      .mockResolvedValueOnce({ pageInfo: { page: 1, size: 10, total: 1 }, data: Data.app.list });
    const result = await appInstance.index({ organizationId: Data.org.id, search: '' });
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getPageList').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index({ organizationId: Data.org.id, search: 'demo' });
    expect(result.code).toEqual(500);
  });
});
