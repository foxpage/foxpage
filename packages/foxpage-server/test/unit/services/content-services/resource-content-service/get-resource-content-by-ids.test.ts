import '../../../../../src/services/content-services/index';

import { ResourceContentService } from '../../../../../src/services/content-services/resource-content-service';
import { VersionInfoService } from '../../../../../src/services/version-services/version-info-service';
import Data from '../../../../data';

const appInstance = ResourceContentService.getInstance();
let params: any[] = [];

beforeEach(() => {
  params = [Data.component.versionList[0].contentId];
});

describe('Service content/resource/getResourceContentByIds', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'find')
      .mockResolvedValueOnce([Data.component.versionList[0] as any]);

    const result = await appInstance.getResourceContentByIds(params);
    expect(result['cont_kwVgKvYh552WPnH']).toBeDefined();
  });
});
