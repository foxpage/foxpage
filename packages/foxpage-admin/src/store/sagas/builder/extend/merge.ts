import { merger } from '@foxpage/foxpage-js-sdk';
import { Page } from '@foxpage/foxpage-types';

import { DslType } from '@/types/builder';

/**
 * merge relations
 * @param base
 * @param current
 * @returns
 */
export function mergeRelations(base: DslType['relations'], current: DslType['relations']) {
  return {
    templates: (base.templates || []).concat(current.templates || []),
    variables: (base.variables || []).concat(current.variables || []),
    conditions: (base.conditions || []).concat(current.conditions || []),
    functions: (base.functions || []).concat(current.functions || []),
  } as DslType['relations'];
}

/**
 * merge content
 * @param base
 * @param current
 * @returns merged content
 */
export function mergeContent(base: DslType, current: DslType) {
  const { content: baseContent, components: baseComponents = [] } = base;
  const { content: curContent, components: currentComponents = [] } = current;
  try {
    const mergedContent =
      !!baseContent.schemas && curContent.schemas
        ? merger.merge(baseContent as Page, curContent as Page, {
            strategy: merger.MergeStrategy.COMBINE_BY_EXTEND,
          })
        : curContent;

    return ({
      ...current,
      components: baseComponents.concat(currentComponents),
      content: mergedContent,
      relations: mergeRelations(base?.relations || {}, current.relations),
    } as unknown) as DslType;
  } catch (e) {
    console.error('mergeContent error:', e);
    return null;
  }
}
