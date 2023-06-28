import { cloneDeep } from 'lodash';

import { FormattedData, PageContent, StructureNode } from '@foxpage/foxpage-client-types';

import { store } from '@/store/index';

import { getRelation } from '../services';

import { updateContent } from './update';

export const ignoreRelationParse = (value: any) => {
  return JSON.stringify(value).indexOf('{{') === -1;
};

export function handleGetLocalRelations(pageContent?: PageContent) {
  // current only variables & blocks need to match
  const localVariables = store.getState().builder.main.localVariables;
  const blocks = store.getState().builder.component.blocks;
  const { variables = [], ...rest } = pageContent?.relations || {};
  const _relations = {
    ...rest,
    variables: localVariables,
    blocks: (rest.blocks || []).concat(blocks),
  };
  return _relations;
}

/**
 * do update
 * update content and then init the new state for effect
 * @param effects
 * @param formattedData
 * @param opt
 * @returns
 */
export async function getPageContent(
  effects: StructureNode[] = [],
  formattedData: FormattedData,
  opt?: {
    hook?: (() => PageContent) | null;
    ignoreRelationBind?: boolean;
  },
): Promise<PageContent> {
  const { pageContent } = store.getState().builder.main;
  let newPageContent = pageContent;

  if (!opt?.hook) {
    const content = store.getState().builder.main.content;
    const result = updateContent(effects, formattedData);
    const newContent = { ...content, schemas: result };
    const relations = handleGetLocalRelations(pageContent);
    if (!!opt?.ignoreRelationBind) {
      newPageContent = cloneDeep({
        ...pageContent,
        content: {
          ...newContent,
        },
      });
    } else {
      const relationalResult = await getRelation(newContent, relations);
      newPageContent = cloneDeep({
        ...pageContent,
        content: {
          ...newContent,
          relation: relationalResult.relation,
        },
        relations: { ...relations, variables: relations.variables?.concat(relationalResult.data.variables) },
      });
    }
  } else {
    newPageContent = opt.hook();
  }

  return newPageContent;
}
