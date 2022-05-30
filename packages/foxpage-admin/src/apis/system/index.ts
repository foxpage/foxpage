import FoxpageApi from '@/utils/foxpage-api-sdk';

export const organizationsFetch = (): Promise<Response> =>
  new Promise((resolve) => {
    FoxpageApi.get('/organizations/by-user', {}, (rs: Response) => {
      resolve(rs);
    });
  });
