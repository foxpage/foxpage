import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, SetVersionPictureReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('item')
export class SetFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * set version pictures
   * @param  {SetVersionPictureReq} params
   * @returns {File}
   */
  @Put('/pictures')
  @OpenAPI({
    summary: i18n.sw.setVersionPictures,
    description: '',
    tags: ['File'],
    operationId: 'set-version-pictures',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: SetVersionPictureReq): Promise<ResData<File>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4170801);
      }

      const versionDetail = await this.service.version.info.getDetailById(params.id);
      if (this.notValid(versionDetail)) {
        return Response.warning('The version id is invalid', 2170801);
      }

      const versionPictures = versionDetail.pictures || [];
      await this.service.version.info.updateDetail(params.id, {
        pictures: _.concat(params.pictures, versionPictures),
      });

      return Response.success('Set version pictures success', 1170801);
    } catch (err) {
      return Response.error(err, i18n.file.setDeleteStatusFailed, 3170801);
    }
  }
}
