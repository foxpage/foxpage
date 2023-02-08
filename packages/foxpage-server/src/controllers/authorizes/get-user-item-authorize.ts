import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { AuthInfo } from '../../types/authorize-type';
import { FoxCtx, ResData } from '../../types/index-types';
import { AuthInfoRes, GetAuthReq } from '../../types/validates/authorize-validate-types';
import * as Response from '../../utils/response';
import { authListToMask } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('authorizes')
export class GetUserItemAuthorizeDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the target id auth list
   * @param  {AuthInfoRes} params
   */
  @Get('/item')
  @OpenAPI({
    summary: i18n.sw.getAuthorizeList,
    description: '',
    tags: ['Authorize'],
    operationId: 'get-item-user-authorize',
  })
  @ResponseSchema(AuthInfoRes)
  async index(@Ctx() ctx: FoxCtx, @QueryParams() params: GetAuthReq): Promise<ResData<AuthInfo[]>> {
    try {
      let mask: number = 0;
      const userId = ctx.userInfo.id;
      let fileId: string = '';
      let folderId: string = '';

      const [appDetail, appAuthList] = await Promise.all([
        this.service.application.getDetailById(params.applicationId),
        this.service.auth.find({
          type: TYPE.APPLICATION,
          typeId: params.applicationId,
          targetId: userId,
          deleted: false,
        }),
      ]);

      // Current user has app admin auth
      mask = appDetail?.creator === userId ? 1 : appAuthList[0]?.mask || 0;

      if (params.type === TYPE.APPLICATION) {
        mask = _.sum(authListToMask([mask]));
      } else if (!params.typeId) {
        return Response.warning(i18n.auth.invalidTypeId, 2180401);
      }

      if ((mask & 1) !== 1 && params.type === TYPE.CONTENT) {
        const [contentDetail, contentAuthList] = await Promise.all([
          this.service.content.info.getDetailById(params.typeId),
          this.service.auth.find({
            type: TYPE.CONTENT,
            typeId: params.typeId,
            targetId: userId,
            deleted: false,
          }),
        ]);
        mask = _.sum(
          authListToMask(
            _.concat([mask], contentDetail?.creator === userId ? [1] : _.map(contentAuthList, 'mask')),
          ),
        );
        fileId = contentDetail?.fileId || '';
      }

      if ((mask & 1) !== 1 && (params.type === TYPE.FILE || fileId)) {
        const [fileDetail, fileAuthList] = await Promise.all([
          this.service.file.info.getDetailById(fileId || params.typeId),
          this.service.auth.find({
            type: TYPE.FILE,
            typeId: fileId || params.typeId,
            targetId: userId,
            deleted: false,
          }),
        ]);
        mask = _.sum(
          authListToMask(
            _.concat([mask], fileDetail?.creator === userId ? [1] : _.map(fileAuthList, 'mask')),
          ),
        );
        folderId = fileDetail?.folderId || '';
      }

      if ((mask & 1) !== 1 && (params.type === TYPE.FOLDER || folderId)) {
        const [folderDetail, folderAuthList] = await Promise.all([
          this.service.folder.info.getDetailById(folderId || params.typeId),
          this.service.auth.find({
            type: TYPE.FOLDER,
            typeId: folderId || params.typeId,
            targetId: userId,
            deleted: false,
          }),
        ]);
        mask = _.sum(
          authListToMask(
            _.concat([mask], folderDetail?.creator === userId ? [1] : _.map(folderAuthList, 'mask')),
          ),
        );
      }

      return Response.success({ type: params.type, typeId: params.typeId, mask }, 1180401);
    } catch (err) {
      return Response.error(err, i18n.auth.addAuthorizedFailed, 3180401);
    }
  }
}
