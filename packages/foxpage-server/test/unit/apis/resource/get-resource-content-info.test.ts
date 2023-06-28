import { GetResourceContentDetail } from '../../../../src/controllers/resources/get-resource-content-info';
import { FileContentService } from '../../../../src/services/content-services/file-content-service';
import { VersionNumberService } from '../../../../src/services/version-services/version-number-service';
import Data from '../../../data';

const resInstance = new GetResourceContentDetail();

let params = {
  applicationId: Data.app.id,
  id: Data.content.id,
  fileId: Data.file.id,
};

beforeEach(() => {
  params = {
    applicationId: Data.app.id,
    id: Data.content.id,
    fileId: Data.file.id,
  };
});

describe('Get: /resources/content-info', () => {
  it('response success', async () => {
    jest
      .spyOn(VersionNumberService.prototype, 'getContentByNumber')
      .mockResolvedValue(<any>Data.version.list[0]);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response success with empty id', async () => {
    params.id = '';
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue(Data.content.list);
    jest.spyOn(VersionNumberService.prototype, 'getContentByNumber').mockResolvedValue(<any>null);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(200);
  });

  it('response invalid id and fileId', async () => {
    params.id = <any>undefined;
    params.fileId = <any>undefined;

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response invalid fileId', async () => {
    params.id = '';
    jest.spyOn(FileContentService.prototype, 'getContentByFileIds').mockResolvedValue([]);

    const result = await resInstance.index(params);

    expect(result.code).toEqual(400);
  });

  it('response error', async () => {
    jest
      .spyOn(VersionNumberService.prototype, 'getContentByNumber')
      .mockRejectedValue(new Error('mock error'));

    const result = await resInstance.index(params);
    expect(result.code).toEqual(500);
  });
});
