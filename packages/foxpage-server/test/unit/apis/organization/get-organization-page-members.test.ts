import _ from 'lodash';

import { GetOrganizationPageMemberList } from '../../../../src/controllers/organizations/get-organization-page-members';
import { OrgService } from '../../../../src/services/organization-service';
import { UserService } from '../../../../src/services/user-service';
import Data from '../../../data';

const appInstance = new GetOrganizationPageMemberList();

let params: any = {};

beforeEach(() => {
  params = {
    organizationId: Data.org.id,
    page: 1,
    size: 10,
  };
});

describe('Get: /organizations/member-searchs', () => {
  it('response success', async () => {
    jest.spyOn(OrgService.prototype, 'getDetailById').mockResolvedValueOnce(Data.org.list[0] as any);
    jest
      .spyOn(UserService.prototype, 'getUserBaseObjectByIds')
      .mockResolvedValueOnce(Data.user.userBaseObject as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1010401);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(params);

    expect(result.status).toEqual(3010401);
  });
});
