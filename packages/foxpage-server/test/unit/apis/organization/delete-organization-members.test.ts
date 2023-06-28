import _ from 'lodash';

import { DeleteOrganizationMembers } from '../../../../src/controllers/organizations/delete-organization-members';
import { AuthService } from '../../../../src/services/authorization-service';
import { OrgService } from '../../../../src/services/organization-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new DeleteOrganizationMembers();

let params: any = {};
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

  params = {
    id: Data.org.id,
    userIds: [Data.user.id],
  };
});

describe('Put: /organizations/member-status', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(true);
    jest.spyOn(OrgService.prototype, 'updateMembersStatus').mockResolvedValueOnce('' as never);
    jest.spyOn(OrgService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(OrgService.prototype, 'getDetailById').mockResolvedValueOnce(Data.org.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1010301);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4010301);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3010301);
  });
});
