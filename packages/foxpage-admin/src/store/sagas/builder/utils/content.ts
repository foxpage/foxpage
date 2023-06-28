import { Content, PageContent, StructureNode } from '@/types/index';

export const getSaveContent = <T extends StructureNode>(
  pageContent: PageContent,
  opt: { pageNode: T | undefined | null; clearVersion?: boolean },
) => {
  const { content, ...pageRest } = pageContent;
  const { schemas = [], ...rest } = content;
  const { pageNode, clearVersion = false } = opt;
  let newSchemas = wrapperSchema(schemas, clearVersion);

  // deal with page node
  if (pageNode && pageNode.id) {
    const newPageNode = newSchemas.find((item) => item.id === pageNode.id);
    if (newPageNode) {
      newPageNode.props = pageNode.props;
      newPageNode.directive = pageNode.directive;
    } else {
      newSchemas.push(pageNode);
    }
  }

  return { ...pageRest, content: { ...rest, schemas: newSchemas } as Content } as PageContent;
};

export const wrapperSchema = <T extends StructureNode>(schemas: T[] = [], clearVersion?: boolean) => {
  const list: T[] = [];
  schemas.forEach((item) => {
    const node = initValidNode(item) as T;
    if (clearVersion) {
      node.version = '';
    }
    if (item.children && item.children.length > 0) {
      node.children = wrapperSchema(item.children, clearVersion);
    }
    list.push(node);
  });
  return list;
};

export const initValidNode = (item: StructureNode) => {
  const { id, name, label, props, version, type, extension = {}, directive } = item;
  const node = { id, name, label, props, version, type, extension, directive } as StructureNode;
  return node;
};

export const getNameVersions = (content?: PageContent['content']): { name: string; version: string }[] => {
  if (!content) {
    return [];
  }
  const result: { name: string; version: string }[] = [];
  const caches: Record<string, boolean> = {};
  const schemas = content.schemas || [];
  const doFn = (list: StructureNode[] = []) => {
    list.forEach((item) => {
      if (item.version) {
        const key = `${item.name}@${item.version || ''}`;
        if (!caches[key]) {
          caches[key] = true;
          result.push({ name: item.name, version: item.version || '' });
        }
      }
      if (item.children) {
        doFn(item.children);
      }
    });
  };
  doFn(schemas);
  return result;
};
