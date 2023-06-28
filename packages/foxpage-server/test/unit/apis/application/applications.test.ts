// import { Application } from '@foxpage/foxpage-server-types';

import { GetAppDetail } from '../../../../src/controllers/applications/applications';
import { ApplicationService } from '../../../../src/services/application-service';
import Data from '../../../data';

const apiPath = '/applications';
const appInstance = new GetAppDetail();

describe('Get: ' + apiPath, () => {
  it('response success', async () => {
    // jest
    //   .spyOn(ApplicationService.prototype, 'getAppDetailWithFolder')
    //   .mockResolvedValue(Object.assign({ folders: Data.folder.list }, <Application>Data.app.list[0]));
    // const result = await appInstance.index({ applicationId: Data.app.id, type: '' });
    // expect(result.code).toEqual(200);
  });
  it('response error', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getAppDetailWithFolder')
      .mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index({ applicationId: Data.app.id, type: '' });
    expect(result.code).toEqual(500);
  });
});
