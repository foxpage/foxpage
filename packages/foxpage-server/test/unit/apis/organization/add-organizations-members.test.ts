import _ from 'lodash';

import { AddOrganizationMembers } from '../../../../src/controllers/organizations/add-organizations-members';
import { AuthService } from '../../../../src/services/authorization-service';
import { OrgService } from '../../../../src/services/organization-service';
import { UserService } from '../../../../src/services/user-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddOrganizationMembers();

let params: any = {};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    name: '',
  };
});

describe('Post: /organizations/members', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(true);
    jest
      .spyOn(UserService.prototype, 'getUserDetailByAccount')
      .mockResolvedValueOnce(Data.user.list[0] as any);
    jest.spyOn(UserService.prototype, 'getDetailById').mockResolvedValueOnce(Data.user.list[0] as any);
    jest.spyOn(OrgService.prototype, 'checkUserIdInOrg').mockResolvedValueOnce({});
    jest.spyOn(OrgService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2010103);
  });

  it('response success with userId', async () => {
    params.userId = Data.user.id;
    params.account = '';
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(true);
    jest
      .spyOn(UserService.prototype, 'getUserDetailByAccount')
      .mockResolvedValueOnce(Data.user.list[0] as any);
    jest.spyOn(UserService.prototype, 'getDetailById').mockResolvedValueOnce(Data.user.list[0] as any);
    jest.spyOn(OrgService.prototype, 'checkUserIdInOrg').mockResolvedValueOnce({});
    jest.spyOn(OrgService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1010102);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(4010101);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3010101);
  });
});
