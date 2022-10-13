import supertest from 'supertest';

import { App } from '../../../jest/app-instance';

let app: any = null;

beforeEach(() => {
  app = App.getInstance();
  jest.resetModules();
});

describe('Get: /applications/package-goods-searchs', () => {
  it('response app package goods list', async () => {
    const result = await supertest(app).get(
      '/applications/package-goods-searchs?applicationId=appl_yqfu8BI1BRe15fs',
    );
    expect(result.body.code).toEqual(200);
  });
});
