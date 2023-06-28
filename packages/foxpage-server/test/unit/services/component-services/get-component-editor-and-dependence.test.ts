import '../../../../src/services/content-services/index';

import { ComponentService } from '../../../../src/services/component-service';
import Data from '../../../data';

const appInstance = ComponentService.getInstance();
let params: any[] = [Data.component.versionList[0].content, Data.component.versionList[1].content];

beforeEach(() => {
  params = [Data.component.versionList[0].content, Data.component.versionList[1].content];
});

describe('Service component/getComponentVersionLiveDetails', () => {
  it('response success', async () => {
    const result = await appInstance.getComponentEditorAndDependence(params, ['dependencies']);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual('cont_ahsczPHS2YhiYU');
  });

  it('response success with empty type', async () => {
    const result = await appInstance.getComponentEditorAndDependence(params, null as any);
    expect(result.length).toEqual(3);
  });
});
