import _ from 'lodash';

import { GetOrgList } from '../../../../src/controllers/organizations/get-page-organizations';
import { OrgService } from '../../../../src/services/organization-service';
import Data from '../../../data';

const appInstance = new GetOrgList();

let params: any = {};

beforeEach(() => {
  params = {
    search: '',
    page: 1,
    size: 10,
  };
});

describe('Get: /organization-searchs', () => {
  it('response success', async () => {
    jest.spyOn(OrgService.prototype, 'getPageList').mockResolvedValueOnce(Data.org.list as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1010601);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'getPageList').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(params);

    expect(result.status).toEqual(3010601);
  });
});
