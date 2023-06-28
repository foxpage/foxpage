import '../../../../../src/services/content-services/index';

import { TYPE } from '../../../../../config/constant';
import { ComponentContentService } from '../../../../../src/services/content-services/component-content-service';
import { ContentListService } from '../../../../../src/services/content-services/content-list-service';
import { VersionListService } from '../../../../../src/services/version-services/version-list-service';
import Data from '../../../../data';

const appInstance = ComponentContentService.getInstance();
let params: any = {
  applicationId: '',
  type: '',
  search: '',
  contentIds: [],
  loadOnIgnite: false,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    type: TYPE.COMPONENT,
    search: '',
    contentIds: [],
    loadOnIgnite: false,
  };
});

describe('Service content/component/getComponentVersionLiveDetails', () => {
  it('response success', async () => {
    params.contentIds = null;
    jest
      .spyOn(ContentListService.prototype, 'getAppContentList')
      .mockResolvedValueOnce(Data.component.contentList);
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.component.contentList);
    jest
      .spyOn(VersionListService.prototype, 'getVersionListChunk')
      .mockResolvedValueOnce(Data.component.versionList as any[]);

    const result = await appInstance.getComponentVersionLiveDetails(params);
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('@test/test-component-1');
    expect(result[0].version).toEqual('0.0.4');
    expect(result[1].name).toEqual('@test/test-component-2');
    expect(result[1].version).toEqual('0.0.4');
  });

  it('response success with contentIds', async () => {
    params.contentIds = ['cont_kwVgKvYh552WPnH', 'cont_qW6cfWcCLu6m8R4'];
    jest
      .spyOn(ContentListService.prototype, 'getAppContentList')
      .mockResolvedValueOnce(Data.component.contentList);
    jest
      .spyOn(ContentListService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce(Data.component.contentList);
    jest
      .spyOn(VersionListService.prototype, 'getVersionListChunk')
      .mockResolvedValueOnce(Data.component.versionList as any[]);

    const result = await appInstance.getComponentVersionLiveDetails(params);
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('@test/test-component-1');
    expect(result[0].version).toEqual('0.0.4');
    expect(result[1].name).toEqual('@test/test-component-2');
    expect(result[1].version).toEqual('0.0.4');
  });
});
