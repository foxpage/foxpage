import _ from 'lodash';

import { GetBlockLocaleLiveVersions } from '../../../../src/controllers/pages/get-block-locale-live-versions';
import { ContentRelationService } from '../../../../src/services/content-services/content-relation-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const appInstance = new GetBlockLocaleLiveVersions();
let params = {
  applicationId: Data.app.id,
  ids: [] as string[],
  locale: '',
};
beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    ids: [Data.file.id],
    locale: '',
  };
});

describe('Post: /blocks/locale-live-version', () => {
  it('response success', async () => {
    jest
      .spyOn(FileContentService.prototype, 'getFileLocaleContent')
      .mockResolvedValue({ [Data.content.id]: Data.content.list[0] });
    jest
      .spyOn(VersionListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.version.list as any[]);

    jest
      .spyOn(ContentRelationService.prototype, 'getRelationDetailRecursive')
      .mockResolvedValueOnce({} as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1052102);
  });

  it('response error', async () => {
    jest
      .spyOn(FileContentService.prototype, 'getFileLocaleContent')
      .mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(params);

    expect(result.status).toEqual(3052101);
  });
});
