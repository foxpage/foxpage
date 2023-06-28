import { BLANK_NODE } from '@/constants/build';
import { RightClickCopyType, RightClickPasteType } from '@/constants/right-click';
import { Content, CopyOptions, PageContent, PasteOptions, RenderStructureNode, StructureNode } from '@/types/index';

import { findStructureById, generateStructureId, initRelation, isPageNode, pickNode } from '../utils';

export const initCopyData = (
  node: RenderStructureNode,
  contentData: PageContent,
  opt: CopyOptions,
  appId: string,
) => {
  const { schemas = [], id: contentId } = contentData.content || {};
  const { id } = node;
  const { type } = opt;

  // find node
  let result = findStructureById(schemas, id);
  if (!result) {
    return null;
  }

  // only current node, clear children
  if (type === RightClickCopyType.CURRENT) {
    result = { ...result, children: [] };
  }

  // init relation
  const relationData = initRelation({ ...contentData.content, schemas: [result] }, contentData.relations);

  return { appId, id: contentId, relation: relationData.relation, schemas: [result] };
};

export const initPasteData = (node: RenderStructureNode, content: Content, opt: PasteOptions) => {
  const { type } = opt;
  const { schemas = [] } = content;

  // rootId
  let rootId = node.id;
  if (type === RightClickPasteType.IN) {
  } else {
    rootId = node.extension.parentId || '';
  }

  const format = (list: StructureNode[] = [], parentId?: string) => {
    let newList: StructureNode[] = [];
    list.forEach((item) => {
      // filter blank node
      if (item.name !== BLANK_NODE) {
        if (isPageNode(item)) {
          let newChildren: StructureNode[] = [];
          if (item.children?.length) {
            newChildren = format(item.children, parentId);
          }
          newList = newChildren;
        } else {
          const newId = generateStructureId();
          let newChildren: StructureNode[] = [];
          if (item.children?.length) {
            newChildren = format(item.children, newId);
          }
          // format
          const extension: StructureNode['extension'] = { ...item.extension, extendId: '', parentId };
          const newNode = { ...pickNode(item), id: newId, children: newChildren, extension };
          newList.push(newNode);
        }
      }
    });
    return newList;
  };

  const result = format(schemas, rootId);
  return result;
};
