import '../../../../../src/services/content-services/index';

import { VersionRelationService } from '../../../../../src/services/version-services/version-relation-service';
import Data from '../../../../data';

const appInstance = VersionRelationService.getInstance();

describe('Service version/relation/moveMockRelations', () => {
  it('response success', async () => {
    const result = await appInstance.moveMockRelations(
      {},
      {
        variable: [Data.content.list[0]],
      },
    );
    expect(result.variables.length).toEqual(1);
    expect(result.variables[0].id).toBeDefined();
    expect(result.variables[0].title).toBeDefined();
    expect(result.variables[0].type).toBeDefined();
  });
});
