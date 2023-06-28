import 'reflect-metadata';

import _ from 'lodash';
import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion, PicType } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { TypeItemPicInfo } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { ItemPictures, UploadPictureRes } from '../../types/validates/picture-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pictures')
export class GetTypeItemPictures extends BaseController {
  constructor() {
    super();
  }

  /**
   * get the type item pictures
   * @param  {ItemPictures} params
   * @returns {UploadPictureRes}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.getItemPicture,
    description: '',
    tags: ['Picture'],
    operationId: 'get-item-picture',
  })
  @ResponseSchema(UploadPictureRes)
  async index(@Body() params: ItemPictures): Promise<ResData<TypeItemPicInfo[]>> {
    try {
      const { type = '', typeIds = [] } = params;
      let contentList: Content[] = [];
      let versionList: ContentVersion[] = [];
      let contentIds: string[] = [];
      let versionIds: string[] = [];

      if (type === TYPE.FILE) {
        contentList = await this.service.content.file.getContentByFileIds(typeIds);
        contentIds = _.map(contentList, 'id');
      }

      type === TYPE.CONTENT && (contentIds = typeIds);
      if (contentIds.length > 0) {
        contentList = await this.service.content.list.getDetailByIds(contentIds);
        versionIds = _.pull(_.map(contentList, 'liveVersionId') as string[], '');
      }

      type === TYPE.VERSION && (versionIds = typeIds);
      if (versionIds.length > 0) {
        versionList = await this.service.version.list.getDetailByIds(versionIds);
      }

      if (type === TYPE.VERSION && versionList.length > 0) {
        contentList[0] = await this.service.content.list.getDetailById(versionList[0].contentId);
      }

      const contentObject = _.keyBy(contentList, 'id');
      let contentVersionPics: Record<string, TypeItemPicInfo[]> = {};
      versionList.map((version) => {
        const itemKey =
          type === TYPE.FILE
            ? contentObject[version.contentId].fileId
            : type === TYPE.CONTENT
            ? version.contentId
            : version.id;
        !contentVersionPics[itemKey] && (contentVersionPics[itemKey] = []);
        contentVersionPics[itemKey].push({
          id: version.contentId,
          name: contentObject[version.contentId]?.title || '',
          versionId: version.id,
          version: version.version,
          pictures: (_.chunk(_.filter(version.pictures || [], { type: 'screenshot' }), 1)[0] || []) as PicType[],
        });
      });

      return Response.success(contentVersionPics, 1210201);
    } catch (err) {
      return Response.error(err, i18n.picture.getItemPicturesFailed, 3210201);
    }
  }
}
