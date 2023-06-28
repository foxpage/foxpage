import { Relation, Schemas } from '../builder';
import { AbstractEntity, BaseFileEntity } from '../common';

// FuncContentSchemaPropsItem
export interface FuncContentSchemaProps {
  async: boolean;
  code: string;
}

// FuncContentSchemaItem
export type FuncContentSchema = Schemas<FuncContentSchemaProps>;

// FuncContentItem
export interface FuncContentEntity {
  id?: string;
  schemas: FuncContentSchema[];
  relation?: Relation;
}

// FuncItem
export interface FuncEntity extends BaseFileEntity<FuncContentEntity> {}

// FuncNewDataItem
export interface FuncNewData extends AbstractEntity {
  application: string;
  deleted: boolean;
  folderId: string;
  intro: string;
  suffix: string;
  contentId?: string;
}

// FuncDeleteDataItem
export interface FuncDeleteData extends Omit<FuncEntity, 'id' | 'tags' | 'type'> {
  deleted: boolean;
  status: string;
}
