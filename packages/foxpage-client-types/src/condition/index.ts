import { Relation, Schemas } from '../builder';
import { AbstractEntity, BaseFileEntity, BaseObjectEntity } from '../common';

export interface TimeZoneType extends BaseObjectEntity {
  desc: string;
  country: string;
}

export interface LocaleTimeZoneConfigType {
  [locale: string]: TimeZoneType[];
}

// ConditionContentSchemaChildrenPropsItem
export interface ConditionContentSchemaChildrenProps extends BaseObjectEntity {
  operation: string;
}

// ConditionContentSchemaChildrenItem
export interface ConditionContentSchemaChildren {
  type: string;
  props: ConditionContentSchemaChildrenProps;
}

// ConditionContentSchemaItem
export interface ConditionContentSchema extends Schemas<any> {
  children: ConditionContentSchemaChildren[];
}

// ConditionContentItem
export interface ConditionContentEntity extends Pick<AbstractEntity, 'id'> {
  relation?: Relation;
  schemas: ConditionContentSchema[];
}

// ConditionItem
export interface ConditionEntity extends Omit<BaseFileEntity<ConditionContentEntity>, 'type'> {
  type?: 'condition';
}
