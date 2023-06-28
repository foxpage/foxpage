import '../../../../src/services/content-services/index';

import { ApplicationService } from '../../../../src/services/application-service';
import Data from '../../../data';

const appInstance = ApplicationService.getInstance();

describe('Service application/getAppResourceFromContent', () => {
  it('response success', async () => {
    jest
      .spyOn(ApplicationService.prototype, 'getDetailByIds')
      .mockResolvedValueOnce([Data.app.list[0] as any]);

    const result = await appInstance.getAppResourceFromContent({
      [Data.component.contentList[0].id]: [Data.component.folderList[0]],
    } as any);
    expect(result.length).toEqual(2);
    expect(result[0].name).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].type).toBeDefined();
    expect(result[0].detail).toBeDefined();
  });
});
