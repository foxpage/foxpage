import { GetContentChanges } from '../../../../src/controllers/contents/get-content-changes';
// import { AuthService } from '../../../../src/services/authorization-service';
import { LogService } from '../../../../src/services/log-service';
// import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const conInstance = new GetContentChanges();

let params = {
  applicationId: Data.app.id,
  timestamp: 0,
};

beforeEach(() => {
  jest.clearAllMocks();

  params = {
    applicationId: Data.app.id,
    timestamp: 0,
  };
});

describe('Post: /contents/changes', () => {
  it('response success', async () => {
    jest.spyOn(LogService.prototype, 'getChangesContentList').mockResolvedValueOnce({});

    const result = await conInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest.spyOn(LogService.prototype, 'getChangesContentList').mockRejectedValue(new Error('mock error'));

    const result = await conInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
