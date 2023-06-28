import '../../../../../src/services/content-services/index';

import { ComponentContentService } from '../../../../../src/services/content-services/component-content-service';
import { FileContentService } from '../../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../../src/services/file-services/file-info-service';
import { VersionListService } from '../../../../../src/services/version-services/version-list-service';
import Data from '../../../../data';

const appInstance = ComponentContentService.getInstance();
let params = {
  applicationId: '',
  contentNameVersion: [],
  type: '',
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    contentNameVersion: [
      { name: Data.component.contentList[0].title, version: Data.component.versionList[0].version },
    ] as never[],
    type: 'component',
  };
});

describe('Service content/component/getAppComponentByNameVersion', () => {
  it('response success', async () => {
    jest
      .spyOn(FileInfoService.prototype, 'getFileIdByNames')
      .mockResolvedValueOnce(Data.component.fileList as any[]);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValueOnce(Data.component.contentList);
    jest
      .spyOn(VersionListService.prototype, 'getContentVersionListByNameVersion')
      .mockResolvedValueOnce(Data.component.versionList as any[]);

    const result = await appInstance.getAppComponentByNameVersion(params);
    expect(result.length).toEqual(1);
    expect(result[0].name).toBeDefined();
    expect(result[0].version).toBeDefined();
    expect(result[0].package).toBeDefined();
  });
});
