import _ from 'lodash';

import { AddOrganizationDetail } from '../../../../src/controllers/organizations/add-organizations';
import { OrgService } from '../../../../src/services/organization-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new AddOrganizationDetail();

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
    name: 'test organization',
  };
});

describe('Post: /organizations', () => {
  it('response success', async () => {
    jest.spyOn(OrgService.prototype, 'addDetail').mockResolvedValueOnce({} as any);
    jest.spyOn(OrgService.prototype, 'getDetailById').mockResolvedValueOnce(Data.org.list[0] as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1010201);
  });

  it('response error', async () => {
    jest.spyOn(OrgService.prototype, 'addDetail').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3010201);
  });
});
