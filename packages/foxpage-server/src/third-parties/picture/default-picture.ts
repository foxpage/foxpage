import { ThirdPartyPicRes } from '../../types/file-types';

class Picture {
  constructor() {}

  /**
   * default upload pic method
   * @param params
   * @returns
   */
  async upload(params: { base64Str: string; name: string }): Promise<ThirdPartyPicRes> {
    return {
      data: {
        url: '',
        name: params.name,
      },
    };
  }
}

export default Picture;
