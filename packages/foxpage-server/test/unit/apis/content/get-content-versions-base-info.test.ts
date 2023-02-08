import _ from 'lodash';

import { GetContentList } from '../../../../src/controllers/contents/get-content-versions-base-info';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionListService } from '../../../../src/services/version-services/version-list-service';
import Data from '../../../data';

const appInstance = new GetContentList();
let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
  };
});

describe('Get: /contents/versions', () => {
  it('response success', async () => {
    jest
      .spyOn(ContentInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(Data.content.list[0] as any);
    jest.spyOn(VersionListService.prototype, 'find').mockResolvedValueOnce(Data.version.list as any[]);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1161501);
  });

  it('response invalid content id', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2161501);
  });

  it('response error', async () => {
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3161501);
  });
});
