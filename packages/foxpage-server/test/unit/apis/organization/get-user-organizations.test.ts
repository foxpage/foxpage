import _ from 'lodash';

import { GetUserOrgList } from '../../../../src/controllers/organizations/get-user-organizations';
import { OrgService } from '../../../../src/services/organization-service';
import { UserService } from '../../../../src/services/user-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetUserOrgList();
let ctx: Partial<FoxCtx> = {};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };
});

describe('Get: /organization/by-user', () => {
  it('response success', async () => {
    jest.spyOn(OrgService.prototype, 'getUserOrg').mockResolvedValueOnce([]);
    jest.spyOn(UserService.prototype, 'getDetailById').mockResolvedValueOnce(Data.user.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx);
    expect(result.status).toEqual(1011001);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'getUserOrg').mockRejectedValue(new Error('mock error'));
    jest.spyOn(UserService.prototype, 'getDetailById').mockResolvedValueOnce(Data.user.list[0] as any);
    const result = await appInstance.index(<FoxCtx>ctx);

    expect(result.status).toEqual(3011001);
  });
});
