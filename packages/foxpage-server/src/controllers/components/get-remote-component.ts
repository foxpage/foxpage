import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ComponentDSL, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { NewResourceDetail } from '../../types/file-types';
import { IdVersion, ResData } from '../../types/index-types';
import { RemotePackageReq, RemotePackageRes } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface RemoteComponentRes {
  resource: {
    groupId: string;
    groupName: string;
    name: string;
    version: string;
    resourceName: string;
    files: Record<string, string | Record<string, string>>;
    id?: string;
  };
  component: {
    id: string;
    version: string;
    content: any;
  };
}

@JsonController('components')
export class GetRemoteComponent extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get remote component data
   *
   * Get the component list with special conditions
   * Get the component latest version detail
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/remote')
  @OpenAPI({
    summary: i18n.sw.getRemoteComponents,
    description: '',
    tags: ['Component'],
    operationId: 'get-remote-component-list',
  })
  @ResponseSchema(RemotePackageRes)
  async index (
    @QueryParams() params: RemotePackageReq,
  ): Promise<ResData<{ components: RemoteComponentRes[]; lastVersion: ContentVersion }>> {
    try {
      // Get remote resource list
      const [resourceList, groupInfo, maxComponentVersion] = await Promise.all([
        this.service.resource.getResourceGroupLatestVersion(params.groupId, { packageName: params.name }),
        this.service.folder.info.getDetailById(params.groupId),
        this.service.version.list.getMaxVersionByFileIds([params.id]),
      ]);

      // Get component last version resource
      let lastVersionResource: Partial<ComponentDSL> = {};
      if (maxComponentVersion[params.id]) {
        lastVersionResource = await this.service.component.getComponentResourcePath(
          maxComponentVersion[params.id].content,
        );
        maxComponentVersion[params.id].content = lastVersionResource;
      }

      const componentMaxVersion = maxComponentVersion[params.id]?.versionNumber || 0;
      const newComponentVersion = this.service.version.number.getVersionFromNumber(componentMaxVersion + 1);

      // filter resources by name
      let mapResourceList: NewResourceDetail[] = [];
      let resourceVersionIds: IdVersion[] = [];
      const packageName = params.name.toLowerCase();
      resourceList.forEach((resource) => {
        if (resource.name.indexOf(packageName) !== -1) {
          mapResourceList.push(resource);
          resource.id && resourceVersionIds.push({ id: resource.id, version: resource.version });
        }
      });

      // Get Exist resource all content and path
      // let resourcePath: Record<string, ContentPath[]> = {};
      // if (resourceVersionIds.length > 0) {
      //   resourcePath = await this.service.resource.getResourceVersionDetail(
      //     params.groupId,
      //     resourceVersionIds,
      //   );
      // }

      // Set default component and resource mapping
      const groupName = groupInfo?.name || '';
      let componentResourceList: RemoteComponentRes[] = [];
      let resourcePathPre = '';
      mapResourceList.forEach((res) => {
        resourcePathPre = [groupName, res.resourceName, res.version].join('/');

        // const resourceFolderObject = _.keyBy(resourcePath[<string>res.id], 'path');
        const browserPath = _.has(res, ['files', 'cjs', 'production.js'])
          ? resourcePathPre + '/umd/production.min.js'
          : '';
        const cssPath = _.has(res, ['files', 'umd', 'style.css']) ? resourcePathPre + '/umd/style.css' : '';
        const debugPath = _.has(res, ['files', 'umd', 'development.js'])
          ? resourcePathPre + '/umd/development.js'
          : '';
        const nodePath = _.has(res, ['files', 'umd', 'production.min.js'])
          ? resourcePathPre + '/cjs/production.js'
          : '';

        const editorPath = _.has(res, ['files', 'umd', 'editor.js'])
          ? resourcePathPre + '/umd/editor.js'
          : '';

        // DO not response asset int resource
        res.files?.assets && delete res.files.assets;

        componentResourceList.push({
          resource: Object.assign({ groupId: params.groupId, groupName }, res),
          component: {
            id: params.id,
            version: newComponentVersion,
            content: {
              resource: {
                entry: {
                  browser: { path: browserPath },
                  css: { path: cssPath },
                  debug: { path: debugPath },
                  node: { path: nodePath },
                  editor: { path: editorPath }
                },
                'editor-entry': [],
              },
              meta: res.meta || {},
              schema: res.schema || {},
            },
          },
        });
      });

      return Response.success(
        {
          components: componentResourceList,
          lastVersion: maxComponentVersion[params.id] || null,
        },
        1111201,
      );
    } catch (err) {
      return Response.error(err, '', 3111201);
    }
  }
}
