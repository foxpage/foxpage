import '../../../../../src/services/content-services/index';

import { ContentLiveService } from '../../../../../src/services/content-services/content-live-service';
import { ContentRelationService } from '../../../../../src/services/content-services/content-relation-service';
import { VersionListService } from '../../../../../src/services/version-services/version-list-service';
import { VersionLiveService } from '../../../../../src/services/version-services/version-live-service';
import { VersionRelationService } from '../../../../../src/services/version-services/version-relation-service';
import Data from '../../../../data';

const appInstance = VersionLiveService.getInstance();

describe('Service version/live/getContentAndRelationVersion', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValueOnce(Data.version.list as any[]);
    jest
      .spyOn(ContentRelationService.prototype, 'getRelationDetailRecursive')
      .mockResolvedValue({ recursiveItem: '', missingRelations: [] } as any);
    jest.spyOn(VersionRelationService.prototype, 'getTypesRelationVersions').mockResolvedValue({} as any);

    const result = await appInstance.getContentAndRelationVersion([]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBeDefined();
    expect(result[0].content).toBeDefined();
    expect(result[0].version).toBeDefined();
    expect(result[0].dslVersion).toBeDefined();
    expect(result[0].relations).toBeDefined();
    expect(result[0].dependMissing).toBeDefined();
    expect(result[0].recursiveItem).toBeDefined();
  });

  it('response success with build status', async () => {
    jest
      .spyOn(VersionListService.prototype, 'getContentMaxVersionDetail')
      .mockResolvedValueOnce({ [Data.version.list[0].contentId]: Data.version.list[0] } as any);
    jest
      .spyOn(ContentRelationService.prototype, 'getRelationDetailRecursive')
      .mockResolvedValue({ recursiveItem: '', missingRelations: [] } as any);
    jest.spyOn(VersionRelationService.prototype, 'getTypesRelationVersions').mockResolvedValue({} as any);

    const result = await appInstance.getContentAndRelationVersion([], true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBeDefined();
    expect(result[0].content).toBeDefined();
    expect(result[0].version).toBeDefined();
    expect(result[0].dslVersion).toBeDefined();
    expect(result[0].relations).toBeDefined();
    expect(result[0].dependMissing).toBeDefined();
    expect(result[0].recursiveItem).toBeDefined();
  });

  it('response with relation invalid', async () => {
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValueOnce(Data.version.list as any[]);
    jest
      .spyOn(ContentRelationService.prototype, 'getRelationDetailRecursive')
      .mockResolvedValue({ recursiveItem: 'invalidDepend', missingRelations: [] } as any);

    const result = await appInstance.getContentAndRelationVersion([]);
    expect(result.length).toEqual(0);
  });
});
