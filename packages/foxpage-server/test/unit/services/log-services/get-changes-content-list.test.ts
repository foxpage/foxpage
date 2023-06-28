import '../../../../src/services/content-services/index';

import { LogModel } from '../../../../src/models/log-model';
import { LogService } from '../../../../src/services/log-service';
import Data from '../../../data';

const appInstance = LogService.getInstance();
let params = {
  applicationId: '',
  timestamp: 0,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    timestamp: 0,
  };
});

describe('Service log/getChangesContentList', () => {
  it('response success', async () => {
    jest.spyOn(LogModel.prototype, 'find').mockResolvedValueOnce(Data.log.changeList as any[]);

    const result = await appInstance.getChangesContentList(params);
    expect(result.lastDataTime).toBeGreaterThan(0);
    expect(result.logChangeObject.file).toBeTruthy();
    expect(result.logChangeObject.file.updates.length).toBeGreaterThan(0);
  });
});
