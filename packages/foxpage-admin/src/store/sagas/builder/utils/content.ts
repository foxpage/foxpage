import { Content, PageContent, StructureNode } from '@/types/index';

export const getSaveContent = <T extends StructureNode>(
  pageContent: PageContent,
  opt: { pageNode: T | null },
) => {
  const { content, ...pageRest } = pageContent;
  const { schemas = [], ...rest } = content;
  const { pageNode } = opt;
  let newSchemas = wrapperSchema(schemas);

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

const wrapperSchema = <T extends StructureNode>(schemas: T[] = []) => {
  const list: T[] = [];
  schemas.forEach((item) => {
    const { id, name, label, props, version, type, children = [], extension = {}, directive } = item;
    const node = { id, name, label, props, version, type, extension, directive } as T;
    if (children.length > 0) {
      node.children = wrapperSchema(children);
    }
    list.push(node);
  });
  return list;
};
