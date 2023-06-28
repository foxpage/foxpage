import '../../../../src/services/content-services/index';

import { ComponentService } from '../../../../src/services/component-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const appInstance = ComponentService.getInstance();
let params: any[] = [];

beforeEach(() => {
  params = Data.component.dependentIdVersions as any[];
});

describe('Service component/getComponentDetailByIdVersion', () => {
  it('response success', async () => {
    jest.spyOn(ComponentService.prototype, 'getComponentVersionNumberFromVersion').mockResolvedValueOnce({
      idNumbers: [{ id: 'cont_quhedzPHS2YhiYU', version: '0.0.4', versionNumber: 4 }],
      liveVersionIds: ['cver_inicU3ESSRDkpjN'],
    });

    jest
      .spyOn(VersionListService.prototype, 'getContentInfoByIdAndNumber')
      .mockResolvedValueOnce(Data.component.dependentList as any[]);
    jest.spyOn(VersionListService.prototype, 'getVersionListChunk').mockResolvedValueOnce([]);

    const result = await appInstance.getComponentDetailByIdVersion(params);
    expect(result['cont_quhedzPHS2YhiYU_0.0.4']).toBeDefined();
  });

  it('response empty', async () => {
    jest.spyOn(ComponentService.prototype, 'getComponentVersionNumberFromVersion').mockResolvedValueOnce({
      idNumbers: [],
      liveVersionIds: [],
    });

    const result = await appInstance.getComponentDetailByIdVersion(params);
    expect(result).toEqual({});
  });
});
