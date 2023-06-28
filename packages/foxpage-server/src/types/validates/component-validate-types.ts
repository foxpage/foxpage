import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ContentIdVersion, PagingReq, ResponseBase, ResponsePageBase } from './index-validate-types';

export class AppComponentId {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component File ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class AppComponentsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component type, component|editor|library' })
  @IsArray()
  @IsOptional()
  type: Array<string>;

  @JSONSchema({ description: 'Component ID list' })
  @IsArray()
  @IsOptional()
  componentIds: Array<string>;

  @JSONSchema({ description: 'Component search' })
  @IsString()
  @IsOptional()
  search: string;

  @JSONSchema({ description: 'Component load On ignite, only effect in component ids is empty' })
  @IsBoolean()
  @IsOptional()
  loadOnIgnite: boolean;
}

export class ResourceEntry {
  @JSONSchema({ description: 'node' })
  @IsString()
  node: string;

  @JSONSchema({ description: 'browser' })
  @IsString()
  @IsOptional()
  browser: string;

  @JSONSchema({ description: 'css' })
  @IsString()
  @IsOptional()
  css: string;

  @JSONSchema({ description: 'debug' })
  @IsString()
  @IsOptional()
  debug: string;
}

export class ComponentResource {
  @JSONSchema({ description: 'entry' })
  @ValidateNested()
  @IsObject()
  @Type(() => ResourceEntry)
  entry: ResourceEntry;

  @JSONSchema({ description: 'editor-entry' })
  @ValidateNested()
  @IsObject()
  @Type(() => ResourceEntry)
  @IsOptional()
  'editor-entry': ResourceEntry;
}
export class ComponentDetail {
  @JSONSchema({ description: 'Component ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Component name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Component version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Type' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'Component details' })
  @IsObject()
  @ValidateNested()
  resource: ComponentResource;

  @JSONSchema({ description: 'Component Schema' })
  @IsString()
  schema: string;
}

export class AppComponentsRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: Array<ComponentDetail>;
}

export class AppComponentListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({
    description:
      'Component type, component|editor|library, multiple types can be passed, separated by commas',
  })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Search characters, component name and ID' })
  @IsString()
  @IsOptional()
  search: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @JSONSchema({ description: 'Number of data per page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  size: number;
}

export class AppComponentVersionListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Component file ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Search characters, component name and ID' })
  @IsString()
  @IsOptional()
  search: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @JSONSchema({ description: 'Number of data per page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  size: number;
}

export class AddComponentReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Component name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'Component type, component|editor|library' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Component type, react.component|dsl.template|...' })
  @IsString()
  @IsOptional()
  componentType: string;
}

export class ComponentFileContentReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component file ID or content ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class ComponentContentVersionReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component file ID or content ID' })
  @IsString()
  @IsOptional()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Component name' })
  @IsString()
  @IsOptional()
  name: string;
}

export class ComponentFileVersionReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component file ID', default: 'Component file ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Component version ID' })
  @IsNumber()
  versionNumber: number;
}

export class ComponentVersionEditReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component version ID', default: 'Component version ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class ComponentVersionUpdateReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Page content version ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page version content' })
  @IsObject()
  @ValidateNested()
  content: any;

  @JSONSchema({ description: 'Page version number' })
  @IsString()
  @IsOptional()
  version: string;
}

export class UpdateComponentReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Component file ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Component Introduction' })
  @IsString()
  intro: string;

  @JSONSchema({ description: 'Component delivery on sdk ignite' })
  @IsBoolean()
  @IsOptional()
  loadOnIgnite: boolean;

  @JSONSchema({ description: 'Component type' })
  @IsString()
  @IsOptional()
  componentType: string;
}

export class UpdateComponentContentReq {
  @JSONSchema({ description: 'Application' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Component content ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Component tags' })
  @IsArray()
  tags: Array<object>;
}

export class AppPackageNameVersion {
  @JSONSchema({ description: 'Component name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Component version' })
  @IsString()
  @IsOptional()
  version: string;
}

export class AppNameVersionPackagesReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component ID list' })
  @ValidateNested({ always: true, each: true })
  @IsArray()
  nameVersions: Array<AppPackageNameVersion>;

  @JSONSchema({ description: 'Component type, component|editor|library' })
  @IsArray()
  @IsOptional()
  type: Array<string>;

  @JSONSchema({ description: 'return canary component' })
  @IsBoolean()
  @IsOptional()
  isCanary: boolean;
}

export class RemotePackageReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Package file ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Resource group ID' })
  @IsString()
  @Length(20, 20)
  groupId: string;

  @JSONSchema({ description: 'Package name ID' })
  @IsString()
  name: string;
}

export class NewComponentDetail {
  @JSONSchema({ description: 'Resource name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Component version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Component name/Resource folder name' })
  @IsString()
  resourceName: string;

  @JSONSchema({ description: 'current component version is new or not' })
  @IsBoolean()
  isNew: boolean;

  @JSONSchema({ description: 'Component files' })
  @IsString()
  files: any;

  @JSONSchema({ description: 'Component ID' })
  @IsString()
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Component resource group ID' })
  @IsString()
  @IsOptional()
  groupId: string;
}

export class RemoteResource {
  @JSONSchema({ description: 'Group ID' })
  @IsString()
  @Length(20, 20)
  groupId: string;

  @JSONSchema({ description: 'Group Name' })
  @IsString()
  groupName: string;

  @JSONSchema({ description: 'Resource alias name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Resource Version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Resource Name' })
  @IsString()
  resourceName: string;

  @JSONSchema({ description: 'Resource file level' })
  @IsObject()
  files: object;

  @JSONSchema({ description: 'Resource meta' })
  @IsObject()
  @IsOptional()
  meta: object;

  @JSONSchema({ description: 'Resource schema' })
  @IsObject()
  @IsOptional()
  schema: object;

  @JSONSchema({ description: 'Resource is new version status' })
  @IsBoolean()
  @IsOptional()
  isNew: boolean;

  @JSONSchema({ description: 'Resource folder id' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  id: string;
}

export class RemoteComponentContent {
  @JSONSchema({ description: 'Component content resource' })
  @IsObject()
  resource: any;

  @JSONSchema({ description: 'Component content schema' })
  @IsObject()
  schema: any;
}

export class RemoteComponent {
  @JSONSchema({ description: 'Component file id' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Component version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Component version' })
  @ValidateNested()
  @Type(() => RemoteComponentContent)
  content: RemoteComponentContent;
}
export class BatchComponentResource {
  @JSONSchema({ description: 'Remote resource detail' })
  @ValidateNested()
  @Type(() => RemoteResource)
  resource: RemoteResource;

  @JSONSchema({ description: 'Remote component detail' })
  @ValidateNested()
  @Type(() => RemoteComponent)
  component: RemoteComponent;

  @JSONSchema({ description: 'Component type, react.component|dsl.template|...' })
  @IsString()
  @IsOptional()
  componentType: string;
}

export class SaveRemotePackageReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'package data list' })
  @ValidateNested({ each: true })
  components: Array<BatchComponentResource>;
}

export class BatchEditorResource {
  @JSONSchema({ description: 'Editor name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Editor resource group id' })
  @IsString()
  groupId: string;

  @JSONSchema({ description: 'Remote component detail' })
  @ValidateNested()
  @Type(() => RemoteComponent)
  component: RemoteComponent;

  @JSONSchema({ description: 'Component type, react.component|dsl.template|...' })
  @IsString()
  @IsOptional()
  componentType: string;
}

export class SaveEditorPackageReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'package editor list' })
  @ValidateNested({ each: true })
  components: Array<BatchEditorResource>;
}

export class RemotePackageRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: BatchComponentResource;
}

export class RemotePagePackageReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource group ID' })
  @IsString()
  @Length(20, 20)
  groupId: string;

  @JSONSchema({ description: 'Resource group name' })
  @IsString()
  @IsOptional()
  groupName: string;

  @JSONSchema({ description: 'component name' })
  @IsString()
  @IsOptional()
  name: string;
}

export class ComponentCategory {
  @JSONSchema({ description: 'Component nick name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Component category name' })
  @IsString()
  categoryName: string;

  @JSONSchema({ description: 'Component group name' })
  @IsString()
  groupName: string;

  @JSONSchema({ description: 'Component Sort' })
  @IsNumber()
  @IsOptional()
  sort?: number;

  @JSONSchema({ description: 'Component Rank' })
  @IsNumber()
  @IsOptional()
  rank?: number;

  @JSONSchema({ description: 'Component Props' })
  @IsObject()
  @IsOptional()
  props?: Record<string, any>;

  @JSONSchema({ description: 'Component category description' })
  @IsString()
  @IsOptional()
  description?: string;

  @JSONSchema({ description: 'Component category screenshot image url' })
  @IsString()
  @IsOptional()
  screenshot?: string;
}

export class DeleteComponentCategoryReq extends AppComponentId {}

export class SetComponentCategoryReq extends AppComponentId {
  @JSONSchema({ description: 'Resource category detail' })
  @ValidateNested()
  @Type(() => ComponentCategory)
  category: ComponentCategory;
}

export class RemotePagePackageRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  data: Array<BatchComponentResource>;
}

export class BatchLiveReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @ValidateNested({ each: true })
  @IsArray()
  idVersions: ContentIdVersion[];
}

export class GetCategoryComponentReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component name or id' })
  @IsString()
  @IsOptional()
  search: string;
}

export class ComponentCategoryTypes {
  @JSONSchema({ description: 'Component category name' })
  @IsString()
  categoryName: string;

  @JSONSchema({ description: 'Component category group names' })
  @IsArray()
  groupNames: Array<string>;
}

export class ComponentCategoryTypesRes extends ResponseBase {
  @ValidateNested({ each: true })
  @Type(() => ComponentCategoryTypes)
  data: Array<ComponentCategoryTypes>;
}

export class GetComponentUsedReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Component name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Only response live version, default is true' })
  @IsBoolean()
  @IsOptional()
  live: boolean;
}

export class SetComponentDeprecatedReq extends AppComponentId {
  @JSONSchema({ description: 'Deprecated status, true|false' })
  @IsBoolean()
  status: boolean;
}

export class SetReferenceComponentLiveReq extends AppComponentId {
  @JSONSchema({ description: 'Version id, if version id is empty, then clear it' })
  @IsString()
  versionId: string;
}
