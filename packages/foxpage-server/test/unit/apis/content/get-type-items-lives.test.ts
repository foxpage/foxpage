import { GetTypeItemLiveList } from '../../../../src/controllers/contents/get-type-items-lives';
import { ContentListService } from '../../../../src/services/content-services/content-list-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: '',
  ids: [] as string[],
};

let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.userInfo = {
    id: 'user_xxxx',
    account: 'mock_user',
  };
  ctx.request = {
    url: '/variables/build-versions',
  };

  params = {
    applicationId: Data.app.id,
    ids: [Data.content.id],
  };
});

const appInstance = new GetTypeItemLiveList();

describe('Get: /variables/lives /conditions/lives /functions/lives', () => {
  it('response success', async () => {
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValue(Data.content.list);
    jest.spyOn(VersionListService.prototype, 'getDetailByIds').mockResolvedValue(Data.version.list as any[]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1161501);
  });

  it('response error', async () => {
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3161501);
  });
});
