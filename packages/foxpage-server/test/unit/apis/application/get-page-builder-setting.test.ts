import { GetPageBuilderSettingList } from '../../../../src/controllers/applications/get-page-builder-setting';
import { ApplicationService } from '../../../../src/services/application-service';
import Data from '../../../data';

const appInstance = new GetPageBuilderSettingList();

let params = {
  applicationId: Data.app.id,
  type: '',
  search: '',
};

beforeEach(() => {
  jest.clearAllMocks();

  params = {
    applicationId: Data.app.id,
    type: 'component',
    search: '',
  };
});

describe('Get: /applications/builder-setting-searchs', () => {
  it('response success', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0] as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1031101);
  });

  it('response success 2', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[1] as any);
    params.search = null as any;
    const result = await appInstance.index(params);
    expect(result.status).toEqual(1031101);
  });

  it('response success with search', async () => {
    params.search = 'hello';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0] as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1031101);
  });

  it('response success with not match search', async () => {
    params.search = 'not match string';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0] as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1031101);
  });

  it('response success with match category search', async () => {
    params.search = 'group.category';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0] as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1031101);
  });

  it('response success with id search', async () => {
    params.search = 'file_R3ydFvJnSsqTAsS';
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockResolvedValueOnce(Data.app.list[0] as any);

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1031101);
  });

  it('response error', async () => {
    jest.spyOn(ApplicationService.prototype, 'getDetailById').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3031101);
  });
});
