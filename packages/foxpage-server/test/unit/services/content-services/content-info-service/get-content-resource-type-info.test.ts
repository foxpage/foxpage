import '../../../../../src/services/content-services/index';

import { ContentInfoService } from '../../../../../src/services/content-services/content-info-service';
import Data from '../../../../data';

const appInstance = ContentInfoService.getInstance();

describe('Service file/list/getContentFileByIds', () => {
  it('response success', async () => {
    const appResources = [
      {
        name: 'UNPKG',
        id: 'rsos_123456789',
        type: 1,
        detail: {
          host: 'https://www.xxx.com/',
          downloadHost: 'https://www.xxx.com/',
        },
      },
      {
        id: 'rsos_abcfedf',
        name: 'ARES',
        type: 2,
        detail: {
          host: 'http://app.fx.xxx.com/',
          downloadHost: 'http://app.fx.xxx.com/',
        },
      },
    ];
    const contentParentObject = {
      [Data.component.contentList[0].id]: [Data.component.folderList[0]],
    };

    const result = await appInstance.getContentResourceTypeInfo(appResources, contentParentObject);
    expect(result['cont_kwVgKvYh552WPnH']).toBeDefined();
  });
});
