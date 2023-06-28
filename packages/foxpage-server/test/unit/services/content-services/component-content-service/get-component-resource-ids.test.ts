import '../../../../../src/services/content-services/index';

import { ComponentContentService } from '../../../../../src/services/content-services/component-content-service';
import Data from '../../../../data';

const appInstance = ComponentContentService.getInstance();
let params: any[] = [Data.component.versionList[0].content, Data.component.versionList[1].content];

beforeEach(() => {
  params = [Data.component.versionList[0].content, Data.component.versionList[1].content];
});

describe('Service content/component/getComponentVersionLiveDetails', () => {
  it('response success', async () => {
    const result = await appInstance.getComponentResourceIds(params, ['browser', 'node', 'css']);
    expect(result).toEqual(
      expect.arrayContaining([
        'cont_UzK1UQE4ceweJmQ',
        'cont_2x5Uah2fCXBAuPA',
        'cont_DZQNURuCuqvaPkB',
        'cont_KGUfqWlPIjjahPH',
        'cont_B8flhBvq16bkqnN',
        'cont_SfIDvoRnO5WEXUj',
      ]),
    );
  });

  it('response success with one item resource invalid', async () => {
    params = [
      Data.component.versionList[0].content,
      Object.assign({}, Data.component.versionList[1].content, {
        resource: { entry: { browser: { contentId: 'cont_KGUfqWlPIjjahPH' } } },
      }),
    ];
    const result = await appInstance.getComponentResourceIds(params, ['browser', 'node', 'css']);
    expect(result).toEqual(
      expect.not.arrayContaining(['cont_KGUfqWlPIjjahPH', 'cont_B8flhBvq16bkqnN', 'cont_SfIDvoRnO5WEXUj']),
    );
  });

  it('response success with empty types', async () => {
    const result = await appInstance.getComponentResourceIds(params, []);
    expect(result).toEqual(
      expect.arrayContaining([
        'cont_UzK1UQE4ceweJmQ',
        'cont_DZQNURuCuqvaPkB',
        'cont_SiexozC4WrlaVfr',
        'cont_2x5Uah2fCXBAuPA',
        'cont_KGUfqWlPIjjahPH',
        'cont_SfIDvoRnO5WEXUj',
        'cont_P52VbsNhDYQ9eJ7',
        'cont_B8flhBvq16bkqnN',
      ]),
    );
  });
});
