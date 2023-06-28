import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

// import { TYPE } from '../../../config/constant';
import { PicCategory } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddItemPicturesReq, UploadPictureRes } from '../../types/validates/picture-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pictures')
export class AddItemPictures extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add the type item picture data
   * @param  {AddItemPicturesReq} params
   * @returns {UploadPictureRes}
   */
  @Post('/items')
  @OpenAPI({
    summary: i18n.sw.addItemPicture,
    description: '',
    tags: ['Picture'],
    operationId: 'add-item-picture',
  })
  @ResponseSchema(UploadPictureRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddItemPicturesReq): Promise<ResData<any[]>> {
    const { applicationId = '', contentId = '', pictures = [] } = params;
    let { projectId = '', fileId = '' } = params;
    let locales: string[] = [];

    try {
      let hasAuth = false;
      if (contentId) {
        hasAuth = await this.service.auth.content(contentId, { ctx });
      } else if (fileId) {
        hasAuth = await this.service.auth.file(fileId, { ctx });
      } else if (projectId) {
        hasAuth = await this.service.auth.folder(projectId, { ctx });
      } else if (applicationId) {
        hasAuth = await this.service.auth.application(applicationId, { ctx });
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4210301);
      }

      // check pic name and url
      let invalidNameOrUrl = false;
      pictures.forEach((pic) => {
        (!pic.name || !pic.url) && (invalidNameOrUrl = true);
      });

      if (invalidNameOrUrl) {
        return Response.warning(i18n.picture.invalidNameOrUrl, 2210301);
      }

      // get item parent ids
      if (contentId) {
        const contentDetail = await this.service.content.info.getDetailById(contentId);
        if (this.notValid(contentDetail) || contentDetail?.applicationId !== applicationId) {
          return Response.warning(i18n.content.invalidContentId, 2210302);
        }

        locales = _.pullAll(_.map(contentDetail.tags, 'locale'), ['', undefined, null]);
        fileId = contentDetail.fileId;
      }

      if (fileId) {
        const fileDetail = await this.service.file.info.getDetailById(fileId);
        if (this.notValid(fileDetail) || fileDetail?.applicationId !== applicationId) {
          return Response.warning(i18n.file.invalidFileId, 2210303);
        }
        projectId = fileDetail.folderId;
      }

      if (projectId) {
        const folderDetail = await this.service.folder.info.getDetailById(projectId);
        if (this.notValid(folderDetail) || folderDetail?.applicationId !== applicationId) {
          return Response.warning(i18n.folder.invalidFolderId, 2210304);
        }
      }

      let category: PicCategory = { applicationId };
      projectId && (category.folderId = projectId);
      fileId && (category.fileId = fileId);
      contentId && (category.contentId = contentId);
      locales.length > 0 && (category.locales = locales);

      for (const item of pictures) {
        this.service.picture.create(
          {
            name: item.name,
            url: item.url,
            category: category,
          },
          { ctx },
        );
      }

      await this.service.picture.runTransaction(ctx.transactions);

      return Response.success(i18n.picture.addItemPictureSuccess, 1210301);
    } catch (err) {
      return Response.error(err, i18n.picture.addItemPictureFailed, 3210301);
    }
  }
}
