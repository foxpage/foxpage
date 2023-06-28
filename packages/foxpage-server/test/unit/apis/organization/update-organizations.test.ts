import _ from 'lodash';

import { UpdateOrganizationDetail } from '../../../../src/controllers/organizations/update-organizations';
import { AuthService } from '../../../../src/services/authorization-service';
import { OrgService } from '../../../../src/services/organization-service';
import { TeamService } from '../../../../src/services/team-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdateOrganizationDetail();
let ctx: Partial<FoxCtx> = {};
let params = {
  organizationId: Data.org.id,
  name: '',
};
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
    organizationId: Data.org.id,
    name: 'test new name',
  };
});

describe('Put: /organizations', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(true);
    jest.spyOn(OrgService.prototype, 'getDetailById').mockResolvedValue(Data.org.list[0] as any);
    jest.spyOn(TeamService.prototype, 'find').mockResolvedValueOnce(Data.team.list as any);
    jest.spyOn(OrgService.prototype, 'updateDetail').mockResolvedValueOnce('' as never);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1010901);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4010901);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'organization').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3010901);
  });
});
