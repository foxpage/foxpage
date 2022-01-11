import { File, FileTypes } from '@foxpage/foxpage-server-types';

import { AddVariableDetail } from '../../../../src/controllers/variables/add-variables';
// import { AuthService } from '../../../../src/services/authorization-service';
import { FileInfoService } from '../../../../src/services/file-services/file-info-service';
import { FolderInfoService } from '../../../../src/services/folder-services/folder-info-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

const varInstance = new AddVariableDetail();

let ctx: Partial<FoxCtx> = {};
let params = {
  applicationId: Data.app.id,
  folderId: Data.folder.id,
  content: { id: Data.file.id, schemas: [], relation: {} },
  name: '',
  type: <FileTypes>'variable',
  intro: '',
  suffix: '',
};

beforeEach(() => {
  jest.clearAllMocks();

  ctx.logAttr = { transactionId: '' };
  ctx.operations = [];
  ctx.transactions = [];

  params = {
    applicationId: Data.app.id,
    folderId: Data.folder.id,
    content: { id: Data.file.id, schemas: [], relation: {} },
    name: '',
    type: <FileTypes>'variable',
    intro: '',
    suffix: '',
  };
});

describe('Post: /variables', () => {
  it('response success', async () => {
    // jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  it('response success with folder id', async () => {
    params.folderId = '';
    // jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 0 });
    jest.spyOn(FileInfoService.prototype, 'runTransaction').mockResolvedValueOnce();
    jest.spyOn(FileInfoService.prototype, 'getDetailById').mockResolvedValueOnce(<File>Data.file.list[0]);

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(200);
  });

  // it('response invalid folder id', async () => {
  //   params.folderId = '';
  //   // jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
  //   jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce('');

  //   const result = await varInstance.index(<FoxCtx>ctx, params);
  //   expect(result.code).toEqual(400);
  // });

  it('response invalid id', async () => {
    params.folderId = '';
    // jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 1 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response variable name exist', async () => {
    params.folderId = '';
    // jest.spyOn(AuthService.prototype, 'file').mockResolvedValueOnce(true);
    jest.spyOn(FolderInfoService.prototype, 'getAppTypeFolderId').mockResolvedValueOnce(Data.folder.id);
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockResolvedValueOnce({ code: 2 });

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response invalid variable name', async () => {
    params.name = '!@#$%demo name';

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest.spyOn(FileInfoService.prototype, 'addFileDetail').mockRejectedValue(new Error('mock error'));

    const result = await varInstance.index(<FoxCtx>ctx, params);
    expect(result.code).toEqual(500);
  });
});
