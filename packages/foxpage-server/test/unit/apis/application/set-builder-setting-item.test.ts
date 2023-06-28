import { UpdateApplicationSettingDetail } from '../../../../src/controllers/applications/set-builder-setting-item';
import { ApplicationService } from '../../../../src/services/application-service';
import { AuthService } from '../../../../src/services/authorization-service';
import { FileCheckService } from '../../../../src/services/file-services/file-check-service';
import { FileListService } from '../../../../src/services/file-services/file-list-service';
import { FoxCtx } from '../../../../src/types/index-types';
import Data from '../../../data';

let params = {
  applicationId: Data.app.id,
  type: '',
  setting: [],
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
    type: 'component',
    setting: [
      {
        id: 'file_7ShJRgXM9er5Nqt',
        name: '',
        status: true,
        category: {},
        defaultValue: {},
      },
    ] as any,
  };
});

const appInstance = new UpdateApplicationSettingDetail();

describe('Put: /applications/builder-setting', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.componentList as any[]);
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest
      .spyOn(FileCheckService.prototype, 'checkFileHasLiveContent')
      .mockResolvedValueOnce(['file_7ShJRgXM9er5Nqt']);
    jest.spyOn(ApplicationService.prototype, 'addAppSetting').mockReturnValueOnce();
    jest.spyOn(AuthService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    console.log(result);
    expect(result.status).toEqual(1031201);
  });

  it('response success with update', async () => {
    params.setting = [
      {
        idx: 1,
        id: 'file_7ShJRgXM9er5Nqt',
        name: '',
        status: true,
        category: {},
        defaultValue: {},
      },
    ] as any;

    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.componentList as any[]);
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest
      .spyOn(FileCheckService.prototype, 'checkFileHasLiveContent')
      .mockResolvedValueOnce(['file_7ShJRgXM9er5Nqt']);
    jest.spyOn(ApplicationService.prototype, 'updateAppSetting').mockReturnValueOnce();
    jest.spyOn(AuthService.prototype, 'runTransaction').mockResolvedValueOnce();

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(1031201);
  });

  it('response not live version', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.componentList as any[]);
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0]);
    jest.spyOn(ApplicationService.prototype, 'updateAppSetting').mockReturnValueOnce();
    jest.spyOn(FileCheckService.prototype, 'checkFileHasLiveContent').mockResolvedValueOnce([]);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2031202);
  });

  it('response no auth', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(false);
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(4031201);
  });

  it('response invalid type', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockResolvedValueOnce(true);
    jest.spyOn(FileListService.prototype, 'find').mockResolvedValueOnce(Data.file.list as any);

    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(2031201);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'application').mockRejectedValue(new Error('mock error'));
    const result = await appInstance.index(<FoxCtx>ctx, params);
    expect(result.status).toEqual(3031201);
  });
});
