import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { GetPagePictureReq, UploadPictureRes } from '../../types/validates/picture-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('picture-searchs')
export class GetPageItemPictures extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the page of item pictures
   * @param  {GetPagePictureReq} params
   * @returns {UploadPictureRes}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getPageItemPicture,
    description: '',
    tags: ['Picture'],
    operationId: 'set-item-picture-status',
  })
  @ResponseSchema(UploadPictureRes)
  async index(@Ctx() ctx: FoxCtx, @QueryParams() params: GetPagePictureReq): Promise<ResData<any[]>> {
    const { applicationId = '', type = '', typeId = '', locale = '', search = '' } = params;
    const pageSize = this.service.picture.setPageSize(params);

    try {
      let searchParams: Record<string, any> = {
        'category.applicationId': applicationId,
      };

      type === TYPE.PROJECT && (searchParams['category.folderId'] = typeId);
      type === TYPE.FILE && (searchParams['category.fileId'] = typeId);
      type === TYPE.CONTENT && (searchParams['category.contentId'] = typeId);
      type === TYPE.USER && (searchParams.creator = ctx.userInfo.id);

      locale && (searchParams['category.locales'] = { $in: locale });
      search && (searchParams.name = { $regex: new RegExp(search, 'i') });
      searchParams.deleted = false;

      const [picCount, picList] = await Promise.all([
        this.service.picture.getCount(searchParams),
        this.service.picture.getList(Object.assign({ search: searchParams }, pageSize)),
      ]);

      const userIds = _.map(picList, 'creator');
      const userObject = await this.service.user.getUserBaseObjectByIds(userIds);
      let picInfoList: any[] = [];
      for (const pic of picList) {
        picInfoList.push(
          Object.assign({}, _.omit(pic, ['creator']), {
            creator: userObject[pic.creator],
          }),
        );
      }

      return Response.success(
        {
          pageInfo: this.paging(picCount, pageSize),
          data: picInfoList,
        },
        1210501,
      );
    } catch (err) {
      return Response.error(err, i18n.picture.getPageItemPictureFailed, 3210501);
    }
  }
}
