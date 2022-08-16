import { Application } from '@foxpage/foxpage-server-types';

import { GetApplicationResources } from '../../../../src/controllers/applications/get-application-resources';
import { ApplicationService } from '../../../../src/services/application-service';
import Data from '../../../data';

const appInstance = new GetApplicationResources();

describe('Get: /applications/resources', () => {
  it('response app resource list', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    const result = await appInstance.index({ applicationId: Data.app.id, type: '' });
    expect(result.code).toEqual(200);
  });

  it('response list with empty result', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(<Application>{});
    const result = await appInstance.index({ applicationId: Data.app.id, type: '' });
    expect(result.code).toEqual(200);
  });

  it('response cause error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index({ applicationId: Data.app.id, type: '' });
    expect(result.code).toEqual(500);
  });
});
