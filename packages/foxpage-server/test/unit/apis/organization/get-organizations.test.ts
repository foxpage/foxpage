import _ from 'lodash';

import { GetOrganizationList } from '../../../../src/controllers/organizations/get-organizations';
import { OrgService } from '../../../../src/services/organization-service';
import Data from '../../../data';

const appInstance = new GetOrganizationList();

let params: any = {};

beforeEach(() => {
  params = {
    organizationId: Data.org.id,
    page: 1,
    size: 10,
  };
});

describe('Get: /organizations', () => {
  it('response success', async () => {
    jest.spyOn(OrgService.prototype, 'getDetailById').mockResolvedValueOnce(Data.org.list[0] as any);
    jest.spyOn(OrgService.prototype, 'replaceOrgUserInfo').mockResolvedValueOnce([] as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1010501);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(params);

    expect(result.status).toEqual(3010501);
  });
});
