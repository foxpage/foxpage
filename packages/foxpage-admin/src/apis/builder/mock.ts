import {
  MockBuildDetailFetchParams,
  MockBuildDetailFetchRes,
  MockNewParams,
  MockNewRes,
  MockPublishParams,
  MockUpdateParams,
  MockUpdateRes,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchMock = (params: MockBuildDetailFetchParams): Promise<MockBuildDetailFetchRes> =>
  new Promise((resolve) => {
    FoxPageApi.get('/mocks/build-versions', params, (rs: MockBuildDetailFetchRes) => {
      resolve(rs);
    });
  });

export const saveMock = (params: MockNewParams): Promise<MockNewRes> =>
  new Promise((resolve) => {
    FoxPageApi.post('/mocks', params, (rs: MockNewRes) => {
      resolve(rs);
    });
  });

export const updateMock = (params: MockUpdateParams): Promise<MockUpdateRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/mocks/versions', params, (rs: MockUpdateRes) => {
      resolve(rs);
    });
  });

export const publishMock = (params: MockPublishParams): Promise<MockUpdateRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/mocks/version-publish', params, (rs: MockUpdateRes) => {
      resolve(rs);
    });
  });
