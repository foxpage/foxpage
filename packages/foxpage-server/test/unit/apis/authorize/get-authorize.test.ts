import { GetAuthorizeDetail } from '../../../../src/controllers/authorizes/get-authorize';
import { AuthService } from '../../../../src/services/authorization-service';
import { UserService } from '../../../../src/services/user-service';
import Data from '../../../data';

let params = {
  applicationId: '',
  type: '',
  typeId: '',
};

beforeEach(() => {
  jest.clearAllMocks();

  params = {
    applicationId: Data.app.id,
    type: 'file',
    typeId: Data.file.id,
  };
});

const appInstance = new GetAuthorizeDetail();

describe('Get: /authorizes', () => {
  it('response success', async () => {
    jest.spyOn(AuthService.prototype, 'find').mockResolvedValueOnce(Data.auth.list);
    jest.spyOn(UserService.prototype, 'getDetailObjectByIds').mockResolvedValueOnce({});

    const result = await appInstance.index(params);
    expect(result.status).toEqual(1180401);
  });

  it('response error', async () => {
    jest.spyOn(AuthService.prototype, 'find').mockRejectedValue(new Error('mock error'));

    const result = await appInstance.index(params);
    expect(result.status).toEqual(3180401);
  });
});
