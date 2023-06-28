import '../../../../src/services/content-services/index';

import _ from 'lodash';

import { ComponentService } from '../../../../src/services/component-service';
import Data from '../../../data';

const appInstance = ComponentService.getInstance();

describe('Service component/addNameToEditorAndDepends', () => {
  it('response success', async () => {
    const appResource = _.cloneDeep(Data.component.contentInfo);
    appResource[0].name = '';

    const result = await appInstance.addNameToEditorAndDepends(appResource, {
      [Data.component.contentList[0].id]: Data.component.fileList[0],
    } as any);
    expect(result.length).toEqual(1);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBeDefined();
    expect(result[0].version).toBeDefined();
    expect(result[0].resource).toBeDefined();
    expect(result[0].schema).toBeDefined();
    expect(result[0].isLive).toBeDefined();
  });

  it('response success with resource missing name', async () => {
    const appResource = _.cloneDeep(Data.component.contentInfo);
    appResource[0].name = '';

    const result = await appInstance.addNameToEditorAndDepends(appResource, {
      [Data.component.contentList[0].id]: Data.component.fileList[0],
    } as any);
    expect(result.length).toEqual(1);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBeDefined();
    expect(result[0].version).toBeDefined();
    expect(result[0].resource).toBeDefined();
    expect(result[0].schema).toBeDefined();
    expect(result[0].isLive).toBeDefined();
  });
});
