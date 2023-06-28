import '../../../../../src/services/content-services/index';

import { ContentListService } from '../../../../../src/services/content-services/content-list-service';
import { ContentMockService } from '../../../../../src/services/content-services/content-mock-service';
import { VersionInfoService } from '../../../../../src/services/version-services/version-info-service';
import { VersionListService } from '../../../../../src/services/version-services/version-list-service';
import Data from '../../../../data';

const appInstance = ContentMockService.getInstance();
let params: any[] = [];

beforeEach(() => {
  params = [Data.component.versionList[0].contentId];
});

describe('Service content/resource/getResourceContentByIds', () => {
  it('response success', async () => {
    jest.spyOn(ContentMockService.prototype, 'getContentExtension').mockResolvedValueOnce({
      [Data.component.versionList[0].contentId]: { mockId: 'cont_Jl4MuryYuFMoGoL', extendId: '' },
    });
    jest.spyOn(ContentListService.prototype, 'getDetailByIds').mockResolvedValueOnce([Data.content.list[0]]);
    jest
      .spyOn(VersionListService.prototype, 'getContentInfoByIdAndNumber')
      .mockResolvedValueOnce([Data.version.list[0]] as any);
    jest.spyOn(ContentMockService.prototype, 'getMockRelations').mockResolvedValueOnce({});
    jest.spyOn(VersionInfoService.prototype, 'formatMockValue').mockResolvedValueOnce([] as never);

    const result = await appInstance.getMockLiveVersions(params);
    expect(result['cont_kwVgKvYh552WPnH']).toBeDefined();
    expect(result['cont_kwVgKvYh552WPnH'].mock).toBeDefined();
    expect(result['cont_kwVgKvYh552WPnH'].extension).toBeDefined();
  });

  it('response empty', async () => {
    const result = await appInstance.getMockLiveVersions([]);
    expect(result).toEqual({});
  });
});
