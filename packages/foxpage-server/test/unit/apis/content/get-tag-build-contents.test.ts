import { GetContentTagVersions } from '../../../../src/controllers/contents/get-tag-build-contents';
import { FoxCtx } from '../../../../src/types/index-types';
// import Data from '../../../data';

const conInstance = new GetContentTagVersions();

// let params = {
//   applicationId: Data.app.id,
//   fileId: '',
//   pathname: '',
//   tags: [],
// };
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  // params = {
  //   applicationId: Data.app.id,
  //   fileId: '',
  //   pathname: '',
  //   tags: [],
  // };
});

describe('Post: /contents', () => {
  it('response success', async () => {
    const result = await conInstance.index(
      <FoxCtx>ctx,
      // params
    );
    expect(result.code).toEqual(200);
  });

  // it('response error', async () => {

  //   const result = await conInstance.index(<FoxCtx>ctx, params);
  //   expect(result.code).toEqual(500);
  // });
});
