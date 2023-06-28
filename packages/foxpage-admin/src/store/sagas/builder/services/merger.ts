import { merger } from '@foxpage/foxpage-js-sdk';
import { Page } from '@foxpage/foxpage-types';

import { PageContent } from '@/types/index';

/**
 * merge relations
 * @param base
 * @param current
 * @returns
 */
export function mergeRelations<T extends PageContent['relations']>(base: T, current: T) {
  return {
    templates: (base.templates || []).concat(current.templates || []),
    variables: (base.variables || []).concat(current.variables || []),
    conditions: (base.conditions || []).concat(current.conditions || []),
    functions: (base.functions || []).concat(current.functions || []),
  } as T;
}

/**
 * merge content
 * @param current
 * @param base
 * @returns merged content
 */
export function merge(current: PageContent, base: PageContent) {
  const { content: baseContent } = base;
  const { content: curContent } = current;

  if (!baseContent) {
    return current;
  }
  try {
    const mergedContent =
      !!baseContent.schemas && curContent?.schemas
        ? merger.merge(baseContent as unknown as Page, curContent as unknown as Page, {
            strategy: merger.MergeStrategy.COMBINE_BY_EXTEND,
          })
        : curContent;

    return {
      ...current,
      content: mergedContent,
      relations: mergeRelations(base?.relations || {}, current.relations),
    } as unknown as PageContent;
  } catch (e) {
    console.error('mergeContent error:', e);
    return null;
  }
}
