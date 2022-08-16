import {
  ConditionContentSchema,
  Content,
  Relation,
  RelationDetails,
  RelationValue,
  StructureNode,
} from '@/types/index';

export const VARIABLE_REG = /\{\{.*?(?=(\}\}))/g;
export const CONDITION_RELATION_KEY = '__conditions';
export const TEMPLATE_RELATION_KEY = '__templates';
export const FUNCTION_RELATION_KEY = '__functions';
export const TIME_CONDITION_KEY = '__condition';
export const CONTEXT_KEY = '__context';
export const THIS_KEY = '$this.children';

/**
 * init relation by content
 * @param content content
 * @param relations relations (contain the relation detail)
 * @returns relation
 */
export const initRelation = (content: Content, relations: RelationDetails) => {
  const relation: Relation = {};
  const invalids: string[] = [];

  const variableMatches = filterVariables(content.schemas);

  const variablePaths = getVariablePath(variableMatches);
  variablePaths.forEach((item) => {
    const [prefix, ...rest] = item.split(':');

    if (prefix !== THIS_KEY) {
      let result: RelationValue | null = null;

      switch (prefix) {
        case TEMPLATE_RELATION_KEY: {
          result = initTemplateRelation(rest[0]);
          break;
        }
        case CONDITION_RELATION_KEY: {
          result = initConditionRelation(rest[0]);
          break;
        }
        case FUNCTION_RELATION_KEY: {
          result = initConditionRelation(rest[0]);
          break;
        }
        case CONTEXT_KEY: {
          result = initSysRelation();
          break;
        }
        case THIS_KEY: {
          break;
        }
        default: {
          // general variable
          result = initVariableRelation(prefix, relations.variables);
          break;
        }
      }

      if (result) {
        relation[item] = result;
      } else {
        // invalids will match from server
        invalids.push(item);
      }
    }
  });

  return { relation, invalids };
};

/**
 * init variable relation
 * @param variableKey
 * @param variables
 * @returns
 */
export const initVariableRelation = (variableKey: string, variables: RelationDetails['variables'] = []) => {
  // TODO: support the variable structure
  const variable = variables.find(
    (item) =>
      item.name === variableKey ||
      (item.schemas || []).findIndex((variable) => variable.name === variableKey) > -1,
  );
  if (!variable) {
    return null;
  }
  return { id: variable.id, type: 'variable' } as RelationValue;
};

/**
 * init condition relation
 * @param conditionId
 * @returns
 */
export const initConditionRelation = (conditionId: string) => {
  return { id: conditionId, type: 'condition' } as RelationValue;
};

/**
 * init function relation
 * @param functionId
 * @returns
 */
export const initFunctionRelation = (functionId: string) => {
  return { id: functionId, type: 'function' } as RelationValue;
};

/**
 * init template relation
 * @param templateId
 * @returns
 */
export const initTemplateRelation = (templateId: string) => {
  return { id: templateId, type: 'template' } as RelationValue;
};

/**
 * init sys relation
 * for __context:xx:xx
 * @returns
 */
export const initSysRelation = () => {
  return { type: 'sys_variable' } as RelationValue;
};

/**
 * get variable used path
 * @param values ['{{AA:BB:CC}}']
 * @returns ['AA:BB:CC']
 */
export const getVariablePath = (values: string[]) => {
  return values.map((item: string) => item.replaceAll(/\{\{/g, '')).filter((item) => !!item);
};

export const filterVariables = (list: StructureNode[] = []) => {
  let variableMatches: string[] = [];
  list.forEach((item) => {
    const { props, directive, children = [] } = item;
    const propsStr = JSON.stringify(props);
    const directiveStr = JSON.stringify(directive);
    // match props
    const propsMatches = propsStr?.match(VARIABLE_REG);
    if (propsMatches) {
      variableMatches = variableMatches.concat(propsMatches);
    }
    // match directive
    const dirMatches = directiveStr?.match(VARIABLE_REG);
    if (dirMatches) {
      variableMatches = variableMatches.concat(dirMatches);
    }
    // match children
    if (children.length > 0) {
      variableMatches = variableMatches.concat(filterVariables(children));
    }
  });
  return variableMatches;
};

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

export const isTimeConditionRelation = (schemaItems: ConditionContentSchema) => {
  const { children = [], name = '' } = schemaItems;
  return children.length === 3 && name.startsWith(TIME_CONDITION_KEY);
};
