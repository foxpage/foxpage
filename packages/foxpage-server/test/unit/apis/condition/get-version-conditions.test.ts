import { ContentVersion } from '@foxpage/foxpage-server-types';

import { GetVersionDetail } from '../../../../src/controllers/conditions/get-version-conditions';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import Data from '../../../data';

const varInstance = new GetVersionDetail();

let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    contentId: Data.content.id,
    versionNumber: 10,
  };
});

describe('Get: /conditions/versions', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getContentVersionDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[0]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailById').mockResolvedValueOnce(Data.content.list[0]);
    const result = await varInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response invalid content id', async () => {
    params.contentId = '';
    const result = await varInstance.index(params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getContentVersionDetail')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
