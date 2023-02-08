import { GetApplicationPackageGoodsList } from '../../../../src/controllers/applications/get-page-package-goods';
import Data from '../../../data';

const appInstance = new GetApplicationPackageGoodsList();

beforeEach(() => {
  jest.resetModules();
});

const params = { applicationId: Data.app.id, search: '' };

describe('Get: /applications/package-goods-searchs', () => {
  it('response app package goods list', async () => {
    const result = await appInstance.index(params);
    expect(result.code).toEqual(200);
  });
});
