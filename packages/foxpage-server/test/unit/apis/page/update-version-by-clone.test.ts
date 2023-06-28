import _ from 'lodash';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { UpdatePageVersionDetailByClone } from '../../../../src/controllers/pages/update-version-by-clone';
import { AuthService } from '../../../../src/services/authorization-service';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentRelationService } from '../../../../src/services/content-services/content-relation-service';
import { ContentTagService } from '../../../../src/services/content-services/content-tag-service';
import { RelationService } from '../../../../src/services/relation-service';
import { VersionInfoService } from '../../../../src/services/version-services/version-info-service';
import { VersionLiveService } from '../../../../src/services/version-services/version-live-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new UpdatePageVersionDetailByClone();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  sourceContentId: '',
  targetContentId: '',
  targetContentLocales: [] as string[],
  sourceVersionNumber: 1,
  includeBase: false,
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/pages/clone',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    sourceContentId: Data.content.id,
    targetContentId: Data.content.list[1].id,
    targetContentLocales: [] as string[],
    sourceVersionNumber: 1,
    includeBase: true,
  };
});

const contentLevelInfo = {
  contentInfo: Data.content.list[0],
  fileInfo: Data.file.list[0],
  folderInfo: Data.folder.list[0],
  applicationInfo: Data.app.list[0],
  versionInfo: Data.version.list[0],
};

describe('Put: /pages/clone', () => {
  it('response success', async () => {
    params.targetContentId = '';
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(true);
    jest
      .spyOn(ContentInfoService.prototype, 'getContentLevelInfo')
      .mockResolvedValue(contentLevelInfo as any);
    jest.spyOn(ContentInfoService.prototype, 'create').mockReturnValue(Data.content.list[1]);
    jest
      .spyOn(ContentTagService.prototype, 'getTagsByKeys')
      .mockReturnValue({ extendId: Data.content.list[1].id });
    jest
      .spyOn(VersionLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValueOnce(Data.version.list as ContentVersion[]);
    jest.spyOn(ContentRelationService.prototype, 'createNewRelations').mockResolvedValueOnce({} as any);
    jest.spyOn(VersionInfoService.prototype, 'updateSchemaIdRecursive').mockReturnValue({} as any);
    jest.spyOn(VersionInfoService.prototype, 'createCopyVersion').mockReturnValue({
      newVersion: {},
      idNameMaps: {},
    } as any);
    jest
      .spyOn(VersionInfoService.prototype, 'create')
      .mockReturnValue(Data.version.list[1] as ContentVersion);
    jest
      .spyOn(VersionInfoService.prototype, 'getMaxContentVersionDetail')
      .mockResolvedValueOnce(Data.version.list[0] as ContentVersion);
    jest.spyOn(VersionInfoService.prototype, 'updateDetailQuery').mockReturnValue({} as any);

    jest.spyOn(VersionInfoService.prototype, 'runTransaction').mockResolvedValue();

    jest.spyOn(RelationService.prototype, 'saveVersionRelations').mockResolvedValueOnce({} as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1052001);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockResolvedValueOnce(false);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4052001);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'content').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3052001);
  });
});
