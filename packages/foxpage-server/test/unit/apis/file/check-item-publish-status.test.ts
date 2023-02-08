import _ from 'lodash';

import { CheckItemVersionPublishStatus } from '../../../../src/controllers/files/check-item-publish-status';
import { VersionCheckService } from '../../../../src/services/version-services/version-check-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import Data from '../../../data';

const appInstance = new CheckItemVersionPublishStatus();
let params: any = {};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    contentId: Data.content.id,
  };
});

describe('Get: /versions/publish-check', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as any);
    jest.spyOn(VersionCheckService.prototype, 'versionCanPublish').mockResolvedValueOnce({});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1171101);
  });

  it('response invalid params', async () => {
    params = {
      applicationId: Data.app.id,
    };

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2171101);
  });

  it('response invalid id', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockResolvedValueOnce({} as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(2171102);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxBaseContentVersionDetail')
      .mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3171101);
  });
});
