import { GetApplicationLocales } from '../../../../src/controllers/applications/get-locals';
// import Data from '../../../data';

const appInstance = new GetApplicationLocales();

describe('Post: /applications/locales', () => {
  it('response list', async () => {
    const result = await appInstance
      .index
      // { applicationId: Data.app.id }
      ();
    expect(result.code).toEqual(200);
  });

  it('response error', async () => {
    // const result = await appInstance.index( { applicationId: Data.app.id });
    // expect(result.code).toEqual(500);
  });
});
