import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FileCheck } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('file')
export class UpdateFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update file details, only file name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('/detail')
  @OpenAPI({
    summary: i18n.sw.updateFileDetail,
    description: '',
    tags: ['File'],
    operationId: 'update-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2170601);
    }

    try {
      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4170601);
      }

      const fileDetail = await this.service.file.info.getDetailById(params.id);
      if (this.notValid(fileDetail)) {
        return Response.warning(i18n.file.invalidFileId, 2170602);
      }

      // If the file name is updated, check whether the new file name exists,
      // and you need to check it in the fields listed below
      if (fileDetail.name !== params.name) {
        const newFileParams: FileCheck = _.pick(fileDetail, [
          'name',
          'applicationId',
          'folderId',
          'type',
          'suffix',
          'deleted',
        ]);
        newFileParams.name = params.name;
        newFileParams.deleted = false;
        const newFileExist = await this.service.file.check.checkExist(newFileParams);

        if (newFileExist) {
          return Response.warning(i18n.file.nameExist, 2170603);
        }
      }

      // Update file info
      const fileNameIntro: Pick<File, 'name' | 'intro'> = _.pick(params, ['name', 'intro']);
      await this.service.file.info.updateDetail(params.id, fileNameIntro);

      // Get file details
      const newFileDetail: File = await this.service.file.info.getDetailById(params.id);

      return Response.success(newFileDetail, 1170601);
    } catch (err) {
      return Response.error(err, i18n.file.updateFailed, 3170601);
    }
  }
}
