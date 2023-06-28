import '../../../../../src/services/content-services/index';

import { ContentLiveService } from '../../../../../src/services/content-services/content-live-service';
import { VersionListService } from '../../../../../src/services/version-services/version-list-service';
import Data from '../../../../data';

const appInstance = ContentLiveService.getInstance();
let params = {
  applicationId: '',
  type: '',
  search: '',
  contentIds: [] as string[],
  loadOnIgnite: false,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    type: 'component',
    search: '',
    contentIds: [],
    loadOnIgnite: false,
  };
});

describe('Service content/live/getContentLiveDetails', () => {
  it('response success', async () => {
    params.contentIds = [Data.content.list[1].id];
    jest.spyOn(ContentLiveService.prototype, 'getDetailByIds').mockResolvedValueOnce([Data.content.list[1]]);
    jest
      .spyOn(VersionListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.version.list[0]] as any[]);

    const result = await appInstance.getContentLiveDetails(params);
    expect(result.length).toEqual(1);
    expect(result[0].id).toBeDefined();
    expect(result[0].version).toBeDefined();
    expect(result[0].content).toBeDefined();
  });

  it('response empty result', async () => {
    const result = await appInstance.getContentLiveDetails(params);
    expect(result.length).toEqual(0);
  });
});
