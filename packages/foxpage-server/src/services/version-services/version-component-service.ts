import _ from 'lodash';

import { AppResource, ContentVersion, Resources, ResourceType } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class VersionComponentService extends BaseService<ContentVersion> {
  private static _instance: VersionComponentService;

  constructor() {
    super(Model.version);
  }

  /**
   * Single instance
   * @returns VersionComponentService
   */
  public static getInstance(): VersionComponentService {
    this._instance || (this._instance = new VersionComponentService());
    return this._instance;
  }

  /**
   * Obtain the dependency information of the component from the version
   * @param  {any[]} nameVersionContent
   * @returns Record
   */
  getComponentDependsFromVersions(nameVersionContent: any[]): Record<string, string[]> {
    let dependenceObject: Record<string, string[]> = {};
    nameVersionContent.forEach((version) => {
      dependenceObject[version.name] = _.map(version?.content?.dependence || [], 'name');
    });

    return dependenceObject;
  }

  /**
   * Get the associated resource ids from the entry of the component
   * @param  {Record<string} resource
   * @param  {} string>
   * @returns string
   */
  getComponentResourceIds(resource: Partial<Resources>): string[] {
    let resourceIds: string[] = [];
    Object.keys(resource?.entry || {}).forEach((value) => {
      _.isString((resource.entry as any)[value]) &&
        resourceIds.push((resource.entry as any)[value] as string);
    });

    return resourceIds;
  }

  /**
   * Get the resource id associated with the component from the component details,
   * and get the resource information,
   * and then attach it to the location corresponding to the resource id
   * @param  {ContentVersion[]} componentList
   * @returns Promise
   */
  async mappingResourceToComponent(componentList: ContentVersion[]): Promise<ContentVersion[]> {
    let resourceContentIds: string[] = [];
    componentList.forEach((component) => {
      resourceContentIds = resourceContentIds.concat(
        this.getComponentResourceIds(component.content?.resource || {}),
      );
    });

    // Get resource details
    let newResourceObject: Record<string, any> = {};
    const resourceObject = await Service.content.resource.getResourceContentByIds(resourceContentIds);

    _.forIn(resourceObject, (value, key) => {
      _.forIn(value, (path) => (newResourceObject[key] = { realPath: path }));
    });

    // Matching component resources
    componentList.forEach((component) => {
      if (component.content && component.content.resource) {
        component.content.resource = this.assignResourceToComponent(
          component.content.resource,
          newResourceObject,
        );
      }
    });

    return componentList;
  }

  /**
   * Match the resource details to the component information through contentId,
  * The returned entry needs to distinguish between the returned object, contentId, or only realPath,
  * such as:
  * {
      "host": "https://www.unpkg.com/",
      "downloadHost": "https://www.unpkg.com/",
      "path": "@fox-design/xxxx/dist/umd/production.min.js",
      "contentId": "cont_xxxx"
    }
   * @param  {Record<string} resource
   * @param  {Record<string} resourceObject
   * @returns Record
   */
  assignResourceToComponent(
    resource: Resources,
    resourceObject: Record<string, any>,
    options: { contentResource?: Record<string, AppResource> } = {},
  ): Resources {
    (Object.keys(resource.entry || {}) as ResourceType[]).forEach((key) => {
      const contentId = (resource.entry[key] as any)?.contentId || <string>resource.entry[key] || '';
      if (resourceObject[contentId]) {
        resource.entry[key] = {
          host: options?.contentResource?.[contentId]?.detail?.host || '',
          downloadHost: options?.contentResource?.[contentId]?.detail?.downloadHost || '',
          path: _.pull(resourceObject[contentId]?.realPath?.split('/'), '')?.join('/') || '',
          contentId,
          origin: options?.contentResource?.[contentId]?.name || '',
        };
      } else {
        resource.entry[key] = {};
      }
    });

    (resource['editor-entry'] || []).forEach((editor) => {
      const contentId = editor.id;
      if (resourceObject[contentId]) {
        editor = _.merge(editor, {
          host: options?.contentResource?.[contentId]?.detail?.host || '',
          downloadHost: options?.contentResource?.[contentId]?.detail?.downloadHost || '',
          path: _.pull(resourceObject[contentId]?.realPath?.split('/'), '')?.join('/') || '',
          contentId,
          origin: options?.contentResource?.[contentId]?.name || '',
        });
      }
    });

    return resource;
  }
}
