import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { FileWithOnline } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { StoreFileStatus } from '../../types/store-types';
import { AppFileListReq, FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('files')
export class GetFileList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the specified file under the specified application
   * @param  {FileListReq} params
   * @returns {FileUserInfo}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.getAppFileList,
    description: '',
    tags: ['File'],
    operationId: 'get-app-file-list',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppFileListReq): Promise<ResData<FileWithOnline[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      // Get file details and status of whether it is on the store
      const [fileList, goodsStatusList] = await Promise.all([
        this.service.file.list.getAppFileList(params),
        this.service.store.goods.getAppFileStatus(params.applicationId, params.ids),
      ]);

      const userIds = _.map(fileList, 'creator');
      const goodsStatusObject: Record<string, StoreFileStatus> = _.keyBy(goodsStatusList, 'id');
      const userBaseObject = await this.service.user.getUserBaseObjectByIds(userIds);

      let fileWithOnlineList: FileWithOnline[] = [];
      fileList.forEach((file) => {
        fileWithOnlineList.push(
          Object.assign(
            {
              online: goodsStatusObject?.[file.id]?.status ? true : false,
              creator: userBaseObject[file.creator] || {},
            },
            _.omit(file, 'creator'),
          ) as FileWithOnline,
        );
      });

      return Response.success(fileWithOnlineList || [], 1170301);
    } catch (err) {
      return Response.error(err, i18n.file.listError, 3170301);
    }
  }
}
