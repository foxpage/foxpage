import { ConditionContentSchemaItem } from '@/types/application/condition';

export const CONDITION_RELATION_KEY = '__conditions';
export const TEMPLATE_RELATION_KEY = '__templates';
export const FUNCTION_RELATION_KEY = '__functions';
export const TIME_CONDITION_PREFIX = '__condition';

export const getFunctionRelationKey = (contentId: string) => {
  return `${FUNCTION_RELATION_KEY}:${contentId}`;
};

export const getSystemVariableRelationKey = (attr: string) => {
  return `__context:${attr}`;
};

export const getConditionRelationKey = (contentId: string) => {
  return `${CONDITION_RELATION_KEY}:${contentId}`;
};

export const getTemplateRelationKey = (contentId: string) => {
  return `${TEMPLATE_RELATION_KEY}:${contentId}:schemas`;
};

export const isTimeConditionRelation = (schemaItems: ConditionContentSchemaItem) => {
  return schemaItems && schemaItems.children?.length === 3 && schemaItems.name?.startsWith(TIME_CONDITION_PREFIX);
};
