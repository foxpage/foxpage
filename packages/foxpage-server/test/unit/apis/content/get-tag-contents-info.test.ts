import { File } from '@foxpage/foxpage-server-types';

import { GetTagContentInfo } from '../../../../src/controllers/contents/get-tag-contents-info';
import { ContentInfoService } from '../../../../src/services/content-services/content-info-service';
import { ContentTagService } from '../../../../src/services/content-services/content-tag-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { VersionRelationService } from '../../../../src/services/version-services/version-relation-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const conInstance = new GetTagContentInfo();

let params = {
  applicationId: Data.app.id,
  fileId: '',
  pathname: '',
  tags: [],
};
let ctx: Partial<FoxCtx> = {};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];

  params = {
    applicationId: Data.app.id,
    fileId: '',
    pathname: '',
    tags: <any>[{ query: 'test' }],
  };
});

describe('Post: /contents/tag-versions', () => {
  it('response success', async () => {
    jest.spyOn(ContentTagService.prototype, 'getAppContentByTags').mockResolvedValueOnce(<any>[{}]);
    jest.spyOn(ContentInfoService.prototype, 'getDetailByIds').mockResolvedValueOnce(Data.content.list);
    jest
      .spyOn(VersionRelationService.prototype, 'getRelationDetail')
      .mockResolvedValueOnce(<any>{ [Data.content.list[0].id]: { contents: Data.version.list } });
    jest.spyOn(FileListService.prototype, 'getDetailByIds').mockResolvedValueOnce(<File[]>Data.file.list);

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1160502);
  });

  it('response success with empty', async () => {
    jest.spyOn(ContentTagService.prototype, 'getAppContentByTags').mockResolvedValueOnce([]);

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response tag is empty', async () => {
    params.tags = null as any;

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1160501);
  });

  it('response error', async () => {
    jest.spyOn(ContentTagService.prototype, 'getAppContentByTags').mockRejectedValue(new Error('mock error'));

    const result = await conInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3160501);
  });
});
