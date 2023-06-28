import '../../../../../src/services/content-services/index';

import { ContentInfoService } from '../../../../../src/services/content-services/content-info-service';
import { ContentRelationService } from '../../../../../src/services/content-services/content-relation-service';
import { FileInfoService } from '../../../../../src/services/file-services/file-info-service';
import { VersionListService } from '../../../../../src/services/version-services/version-list-service';
import { VersionRelationService } from '../../../../../src/services/version-services/version-relation-service';
import Data from '../../../../data';

const appInstance = VersionRelationService.getInstance();

let params = {};

beforeEach(() => {
  params = {
    [Data.content.id]: {
      id: Data.content.id,
      version: '0.0.1',
      type: 'variable',
    },
  };
});

describe('Service version/relation/getRelationDetail', () => {
  it('response success', async () => {
    jest.spyOn(ContentRelationService.prototype, 'getRelationDetailRecursive').mockResolvedValueOnce({
      relationList: [],
      dependence: {},
      recursiveItem: '',
      missingRelations: [],
    });
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(VersionListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.version.list as any[]);

    const result = await appInstance.getRelationDetail(params);
    expect(result[Data.content.id]).toBeTruthy();
    expect(result[Data.content.id].files.length).toBeGreaterThan(0);
    expect(result[Data.content.id].contents.length).toBeGreaterThan(0);
    expect(result[Data.content.id].versions.length).toBeGreaterThan(0);
  });

  it('response success', async () => {
    jest.spyOn(ContentRelationService.prototype, 'getRelationDetailRecursive').mockResolvedValueOnce({
      relationList: Data.version.list as any[],
      dependence: {},
      recursiveItem: '',
      missingRelations: [],
    });

    jest.spyOn(VersionListService.prototype, 'getContentMaxVersionDetail').mockResolvedValueOnce({
      [Data.content.id]: Data.version.list[0],
    } as any);
    jest.spyOn(FileInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.file.list as any[]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(VersionListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.version.list as any[]);

    const result = await appInstance.getRelationDetail(params, true);
    expect(result[Data.content.id]).toBeTruthy();
    expect(result[Data.content.id].files.length).toBeGreaterThan(0);
    expect(result[Data.content.id].contents.length).toBeGreaterThan(0);
    expect(result[Data.content.id].versions.length).toBeGreaterThan(0);
  });
});
