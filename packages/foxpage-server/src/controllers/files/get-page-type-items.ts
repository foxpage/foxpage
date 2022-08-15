import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { PageContentData } from '../../types/content-types';
import { AppTypeFileParams, FileAssoc } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppTypeFilesReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

;

// multi route type mapping
const typeMap: Record<string, string> = {
  'pages': TYPE.PAGE,
  'templates': TYPE.TEMPLATE,
  'variables': TYPE.VARIABLE,
  'conditions': TYPE.CONDITION,
  'functions': TYPE.FUNCTION,
  'mocks': TYPE.MOCK,
};

@JsonController('')
export class GetAppPageFileList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of paging files under the app, group by app scope and project scope
   * the types list is, page|template|variable|condition|function|mock
   * response file detail with creator base info
   * @param  {AppTypeFilesReq} params
   * @returns {PageContentData[]}
   */
  @Get('pages/file-searchs')
  @Get('templates/file-searchs')
  @Get('variables/file-searchs')
  @Get('conditions/file-searchs')
  @Get('functions/file-searchs')
  @Get('mocks/file-searchs')
  @OpenAPI({
    summary: i18n.sw.getAppTypeFileList,
    description: '',
    tags: ['Page'],
    operationId: 'get-app-type-file-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@Ctx() ctx: FoxCtx, @QueryParams() params: AppTypeFilesReq): Promise<ResData<PageContentData[]>> {
    const apiType = this.getRoutePath(ctx.request.url, typeMap, 1);
    const hasScopeTypes = [TYPE.VARIABLE, TYPE.CONDITION, TYPE.FUNCTION, TYPE.MOCK];

    try {
      const typePageParams: AppTypeFileParams = Object.assign({}, params, { type: apiType, deleted: false });
      const pageSize = this.service.file.list.setPageSize(params);

      // filter the special project type list
      if (params.scope === TYPE.PROJECT && params.folderId) {
        typePageParams.scope = '';
        typePageParams.scopeId = params.folderId;
      } else if (hasScopeTypes.indexOf(apiType) !== -1) {
        typePageParams.scopeId = await this.service.folder.info.getAppTypeFolderId({ 
          applicationId: params.applicationId,
          type: apiType as AppFolderTypes,
        });
      }

      const result = await this.service.file.list.getAppTypeFilePageList(typePageParams, pageSize);

      let fileList = result.list as FileAssoc[];
      let contentObject: Record<string, Content> = {};
      if (result?.list.length > 0) {
        [fileList, contentObject] = await Promise.all([
          this.service.file.list.getFileAssocInfo(result.list, { type: apiType }),
          hasScopeTypes.indexOf(apiType) !== -1 ? 
          this.service.content.list.getContentObjectByFileIds(_.map(fileList, 'id')) :
          {}
        ]);

        fileList = fileList.map(file => {
          if (!file.version) {
            file.version = {};
          }

          if (contentObject[file.id]) {
            file.version.live = this.service.version.number.getVersionFromNumber(contentObject[file.id].liveVersionNumber);
          }

          return hasScopeTypes.indexOf(apiType) === -1 ? _.omit(file, 'version') : file;
        });
      }

      return Response.success(
        {
          pageInfo: this.paging(result.count, pageSize),
          data: fileList,
        },
        1170601,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getAppPageFileFailed, 1170601);
    }
  }
}
