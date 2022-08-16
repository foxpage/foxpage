import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion, File, Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { FileDetailRes, GetFileParentReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

type MixedData = Folder | File | Content | ContentVersion;

@JsonController('files')
export class GetFileAllParentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the special data (folder, file, content, version) all parent detail
   * @param  {GetFileParentReq} params
   * @returns {FileUserInfo}
   */
  @Get('/parents')
  @OpenAPI({
    summary: i18n.sw.getFileAllPatents,
    description: '',
    tags: ['File'],
    operationId: 'get-file-parents-list',
  })
  @ResponseSchema(FileDetailRes)
  async index(@QueryParams() params: GetFileParentReq): Promise<ResData<MixedData[]>> {
    try {
      const dataType = this.service.log.checkDataIdType(params.id);
      if (!dataType.type) {
        return Response.success([], 1170201);
      }

      let parentList: MixedData[] = [];

      let contentId: string = '';
      if (dataType.type === TYPE.VERSION) {
        const versionDetail = await this.service.version.info.getDetailById(params.id);
        contentId = versionDetail.contentId;
        versionDetail && parentList.push(versionDetail);
      }

      let fileId: string = '';
      if (dataType.type === TYPE.CONTENT || contentId) {
        const contentDetail = await this.service.content.info.getDetailById(contentId || params.id);
        fileId = contentDetail.fileId;
        contentDetail && parentList.unshift(contentDetail);
      }

      let folderId: string = '';
      if (dataType.type === TYPE.FILE || fileId) {
        const fileDetail = await this.service.file.info.getDetailById(fileId || params.id);
        folderId = fileDetail.folderId;
        fileDetail && parentList.unshift(fileDetail);
      }

      if (dataType.type === TYPE.FOLDER || folderId) {
        const folderParentList = await this.service.folder.list.getAllParentsRecursive([
          folderId || params.id,
        ]);
        parentList = (folderParentList[folderId || params.id] as MixedData[]).concat(parentList);
      }

      // Remove system default folder item
      if (
        parentList[0] &&
        _.has(parentList[0], 'parentFolderId') &&
        (parentList[0] as Folder).parentFolderId === ''
      ) {
        delete parentList[0];
      }

      return Response.success(parentList, 1170201);
    } catch (err) {
      return Response.error(err, i18n.file.getFileParentListFailed, 3170201);
    }
  }
}
