import {
  MockBuildDetailFetchParams,
  MockBuildDetailFetchRes,
  MockNewParams,
  MockNewRes,
  MockPublishParams,
  MockUpdateParams,
  MockUpdateRes,
} from '@/types/builder';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const mockFetch = (params: MockBuildDetailFetchParams): Promise<MockBuildDetailFetchRes> =>
  new Promise((resolve) => {
    FoxpageApi.get('/mocks/build-versions', params, (rs: MockBuildDetailFetchRes) => {
      resolve(rs);
    });
  });

export const mockAdd = (params: MockNewParams): Promise<MockNewRes> =>
  new Promise((resolve) => {
    FoxpageApi.post('/mocks', params, (rs: MockNewRes) => {
      resolve(rs);
    });
  });

export const mockUpdate = (params: MockUpdateParams): Promise<MockUpdateRes> =>
  new Promise((resolve) => {
    FoxpageApi.put('/mocks/versions', params, (rs: MockUpdateRes) => {
      resolve(rs);
    });
  });

export const mockPublish = (params: MockPublishParams): Promise<MockUpdateRes> =>
  new Promise((resolve) => {
    FoxpageApi.put('/mocks/version-publish', params, (rs: MockUpdateRes) => {
      resolve(rs);
    });
  });
