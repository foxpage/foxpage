import { pageParams } from './global.data';

export const mockUseLocation = () => {
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn().mockImplementation(() => {
      return {
        pathname: '/test-route',
        search: '',
        hash: '',
        state: null,
      };
    }),
  }));
};

export const mockUseParams = () => {
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => {
      return {
        ...pageParams,
      };
    }),
  }));
};
