import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ComponentDSL, ContentVersion } from '@foxpage/foxpage-server-types';

import { config, i18n } from '../../../app.config';
import { NewResourceDetail } from '../../types/file-types';
import { IdVersion, ResData } from '../../types/index-types';
import { RemotePagePackageReq, RemotePagePackageRes } from '../../types/validates/component-validate-types';
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
   * Get remote component page data
   *
   * Get the component list with special conditions
   * Get the component latest version detail
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/remote-searchs')
  // @Get('/remote-search')
  @OpenAPI({
    summary: i18n.sw.getRemotePageComponents,
    description: '',
    tags: ['Component'],
    operationId: 'get-remote-page-component-list',
  })
  @ResponseSchema(RemotePagePackageRes)
  async index(
    @QueryParams() params: RemotePagePackageReq,
  ): Promise<ResData<{ components: RemoteComponentRes[]; lastVersion: ContentVersion }>> {
    try {
      const pageSize = this.service.application.setPageSize(params);
      const groupInfo = await this.service.folder.info.getDetailById(params.groupId);
      let resourceData = await this.service.resource.getResourceGroupLatestVersion(params.groupId, {
        packageName: params.groupName || groupInfo.name,
        proxy: config.proxy || '',
      });

      if (params.name) {
        resourceData = _.filter(resourceData, (resource) => resource.name.indexOf(params.name) !== -1);
      }

      const packageList = _.chunk(resourceData, pageSize.size)[pageSize.page - 1] || [];

      const componentNames = _.map(packageList, 'name');
      const componentInfos = await this.service.component.getComponentInfoByNames(
        params.applicationId,
        componentNames,
      );
      const componentNameObject = _.keyBy(componentInfos, 'name');
      const componentIds = _.map(componentInfos, 'id');

      const maxComponentVersion = await this.service.version.list.getMaxVersionByFileIds(componentIds);

      let lastVersionResource: Record<string, Partial<ComponentDSL>> = {};
      for (const component of componentInfos) {
        if (maxComponentVersion[component.id]) {
          lastVersionResource[component.id] = await this.service.component.getComponentResourcePath(
            maxComponentVersion[component.id].content,
          );
          maxComponentVersion[component.id].content = lastVersionResource[component.id];
        }
      }

      // filter resources by name
      let mapResourceList: NewResourceDetail[] = [];
      let resourceVersionIds: IdVersion[] = [];
      packageList.forEach((resource) => {
        mapResourceList.push(resource);
        resource.id && resourceVersionIds.push({ id: resource.id, version: resource.version });
      });

      const groupName = groupInfo?.name || '';
      let remoteComponentList: any[] = [];
      let resourcePathPre = '';
      mapResourceList.forEach((res) => {
        resourcePathPre = [groupName, res.resourceName, res.version].join('/');

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

        const componentId = componentNameObject[res.name]?.id || '';
        const componentMaxVersion = maxComponentVersion[componentId]?.versionNumber || 0;
        const newComponentVersion = this.service.version.number.getVersionFromNumber(componentMaxVersion + 1);

        remoteComponentList.push({
          components: [
            {
              resource: Object.assign({ groupId: params.groupId, groupName }, res),
              component: {
                id: componentId,
                version: newComponentVersion,
                content: {
                  resource: {
                    entry: {
                      browser: { path: browserPath },
                      css: { path: cssPath },
                      debug: { path: debugPath },
                      node: { path: nodePath },
                      editor: { path: editorPath },
                    },
                    'editor-entry': [],
                    dependencies: [],
                  },
                  meta: res.meta || {},
                  schema: res.schema || {},
                },
              },
            },
          ],
          lastVersion: maxComponentVersion[componentId] || null,
        });
      });

      return Response.success(
        {
          data: remoteComponentList,
          pageInfo: {
            page: pageSize.page,
            size: pageSize.size,
            total: resourceData.length || 0,
          },
        },
        1151201,
      );
    } catch (err) {
      return Response.error(err, 'Get remote component list failed', 3151201);
    }
  }
}
