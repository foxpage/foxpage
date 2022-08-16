import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ResData } from '../types/index-types';
import * as Response from '../utils/response';

import { BaseController } from './base-controller';

@JsonController('exports')
export class GetAppDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get application details, including default folder information under the application
   * @param  {AppDetailReq} params
   * @returns {AppWithFolder} Promise
   */
  @Get('')
  @OpenAPI({
    summary: 'export collection',
    description: '',
    tags: ['Application'],
    operationId: 'export-collection-list',
  })
  @ResponseSchema('')
  async index(@QueryParams() params: { col: string }): Promise<ResData<any[]>> {
    try {
      let collectionList: any[] = [];
      switch (params.col.toLowerCase()) {
        case 'application':
          collectionList = await this.service.application.find({});
          break;
        case 'folder':
          collectionList = await this.service.folder.list.find({});
          break;
        case 'file':
          collectionList = await this.service.file.list.find({});
          break;
        case 'content':
          collectionList = await this.service.content.list.find({
            fileId: { $ne: 'file_7vvqMgOWOiJs3GS' },
          });
          break;
        case 'version':
          collectionList = await this.service.version.list.find({});
          break;
        case 'relation':
          collectionList = await this.service.relation.find({});
          break;
        case 'organization':
          collectionList = await this.service.org.find({});
          break;
        case 'goods':
          collectionList = await this.service.store.goods.find({});
          break;
        case 'order':
          collectionList = await this.service.store.order.find({});
          break;
        case 'team':
          collectionList = await this.service.team.find({});
          break;
        case 'user':
          collectionList = await this.service.user.find({});
          break;
        case 'log':
          collectionList = await this.service.log.find({});
          break;
      }
      return Response.success(collectionList);
    } catch (err) {
      return Response.error(err, (<Error>err).message);
    }
  }
}
