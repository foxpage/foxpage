import _ from 'lodash';

import { Content, ContentVersion, File, Folder } from '@foxpage/foxpage-server-types';

import { GetProjectPagesList } from '../../../../src/controllers/projects/get-project-pages';
import { ContentLiveService } from '../../../../src/services/content-services/content-live-service';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const appInstance = new GetProjectPagesList();
let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  projectId: '',
  filter: {
    pathList: [] as any[],
  },
};
beforeEach(() => {
  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];
  ctx.userLogs = [];
  ctx.request = {
    url: '/project/files-info',
  };
  ctx.userInfo = {
    id: Data.user.id as string,
    account: Data.user.account,
  };

  params = {
    applicationId: Data.app.id,
    projectId: Data.folder.id,
    filter: {
      pathList: ['test-path'],
    },
  };
});

describe('Post: /project/files-info', () => {
  it('response success', async () => {
    const versionList = _.cloneDeep(Data.version.list);
    versionList[0].contentId = Data.content.list[0].id;
    versionList[1].contentId = Data.content.list[1].id;
    jest
      .spyOn(FolderInfoService.prototype, 'getDetailById')
      .mockResolvedValueOnce(<Folder>Data.folder.list[0]);
    jest.spyOn(FileInfoService.prototype, 'getFileDetailByNames').mockResolvedValue(<File>Data.file.list[0]);
    jest
      .spyOn(FileContentService.prototype, 'getContentByFileIds')
      .mockResolvedValue(<Content[]>Data.content.list);
    jest
      .spyOn(ContentLiveService.prototype, 'getContentLiveDetails')
      .mockResolvedValue(<ContentVersion[]>versionList);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1040601);
  });

  it('response invalid project', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<Folder>{});

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2040601);
  });

  it('response error', async () => {
    jest.spyOn(FolderInfoService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(<FoxCtx>ctx, params);

    expect(result.status).toEqual(3040601);
  });
});
