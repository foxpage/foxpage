import _ from 'lodash';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { GetVariableBuildDetail } from '../../../../src/controllers/variables/get-variable-build-versions';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import { VersionRelationService } from '../../../../src/services/version-services/version-relation-service';
import Data from '../../../data';

const varInstance = new GetVariableBuildDetail();

describe('Get: /variables/build-version', () => {
  it('response build detail', async () => {
    jest.spyOn(VersionNumberService.prototype, 'getLatestVersionNumber').mockResolvedValueOnce(1);
    jest
      .spyOn(VersionInfoService.prototype, 'getDetail')
      .mockResolvedValueOnce(<ContentVersion>Data.version.list[1]);
    jest
      .spyOn(VersionRelationService.prototype, 'getVersionRelations')
      .mockResolvedValueOnce(_.keyBy(<ContentVersion[]>Data.version.list, 'id'));
    jest.spyOn(RelationService.prototype, 'formatRelationResponse').mockResolvedValueOnce({});

    const result = await varInstance.index({ applicationId: Data.app.id, id: Data.content.id });
    expect(result.code).toEqual(200);
  });

  it('response build detail with empty data', async () => {
    jest.spyOn(VersionNumberService.prototype, 'getLatestVersionNumber').mockResolvedValueOnce(1);
    jest.spyOn(VersionInfoService.prototype, 'getDetail').mockResolvedValueOnce(<ContentVersion>{});
    jest.spyOn(VersionRelationService.prototype, 'getVersionRelations').mockResolvedValueOnce({});
    jest.spyOn(RelationService.prototype, 'formatRelationResponse').mockResolvedValueOnce({});

    const result = await varInstance.index({ applicationId: Data.app.id, id: Data.content.id });
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionNumberService.prototype, 'getLatestVersionNumber')
      .mockRejectedValue(new Error('mock error'));
    const result = await varInstance.index({ applicationId: Data.app.id, id: Data.content.id });
    expect(result.code).toEqual(500);
  });
});
