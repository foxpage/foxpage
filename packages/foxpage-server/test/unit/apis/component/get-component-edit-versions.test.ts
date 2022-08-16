import { ContentVersion } from '@foxpage/foxpage-server-types';

import { GetComponentVersionDetail } from '../../../../src/controllers/components/get-component-edit-versions';
import { ComponentService } from '../../../../src/services/component-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import Data from '../../../data';

const comInstance = new GetComponentVersionDetail();

let params = {
  applicationId: Data.app.id,
  id: Data.version.id,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.version.id,
  };
});

describe('Get: /components/edit-versions', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValue(<ContentVersion>Data.version.list[0]);
    jest
      .spyOn(ComponentService.prototype, 'getComponentResourcePath')
      .mockResolvedValue(<any>Data.version.list[0]?.content);

    const result = await comInstance.index(params);
    expect(result.code).toEqual(200);
  });

  it('response invalid version id', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValue(<any>null);

    const result = await comInstance.index(params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockRejectedValue(new Error('mock error'));

    const result = await comInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
