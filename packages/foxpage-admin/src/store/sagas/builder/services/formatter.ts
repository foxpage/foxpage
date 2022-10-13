import { BLANK_NODE, PAGE_COMPONENT_NAME, BLOCK_COMPONENT_NAME, STYLE_CONTAINER } from '@/constants/index';
import {
  Component,
  Content,
  FormattedData,
  Mock,
  PageContent,
  RenderStructureNode,
  StructureNode,
} from '@/types/index';

import { getStyleWrapper, initMockNode, structureToNodeMap, withVariable, withCondition } from '../utils';

export type FormatOptions = {
  origin: PageContent;
  extend?: PageContent;
  mocks: Mock[];
  components: Component[];
  rootNode?: StructureNode;
};

type FormatSchemasOptions = Omit<FormattedData, 'formattedSchemas'> & {
  pageContent: PageContent;
  extendContent?: PageContent;
  rootNode?: StructureNode;
};

/**
 * format
 * for visual editor render use
 * @param data
 * @returns
 */
export const format = (data: PageContent, opt: FormatOptions) => {
  const { content } = data;
  const { origin, extend, mocks = [], components = [], rootNode } = opt;

  // prepare
  const templates = (origin.relations?.templates || []).concat(extend?.relations?.templates || []);
  const { nodeMap: templateNodeMap } = prepareTemplate(templates);
  const { nodeMap: originPageNodeMap } = preparePage(origin);
  const { nodeMap: extendPageNodeMap } = extend && extend.id ? preparePage(extend) : { nodeMap: {} };
  const { idMap: idMockMap } = prepareMock(mocks);
  const { componentMap } = componentsMap(components);

  // format content.schemas
  const formattedSchemas = formatSchemas(content.schemas, {
    templateNodeMap,
    originPageNodeMap,
    extendPageNodeMap,
    idMockMap,
    componentMap,
    pageContent: origin,
    rootNode,
    extendContent: extend
  });

  return {
    formattedSchemas,
    templateNodeMap,
    originPageNodeMap,
    extendPageNodeMap,
    idMockMap,
    componentMap,
  } as FormattedData;
};

const formatSchemas = (schemas: Content['schemas'] = [], opt: FormatSchemasOptions) => {
  const { templateNodeMap, extendPageNodeMap, idMockMap, pageContent, rootNode, extendContent } = opt;
  const mockEnable = !!pageContent.mock?.enable;

  function doFormat(structures: Content['schemas'] = []) {
    const list: RenderStructureNode[] = [];

    structures.forEach((item) => {
      const renderNode = { ...item } as RenderStructureNode;
      const templateNode = templateNodeMap[item.id];
      const styleNode = getStyleWrapper(item, (opt as unknown) as FormattedData);

      renderNode.props = item.__parsedProps || {};
      // children & not extend removed
      if (item.children && item.name !== BLANK_NODE) {
        renderNode.children = doFormat(item.children);
        renderNode.childIds = renderNode.children.map((item) => item.id);
      } else {
        renderNode.children = [];
        renderNode.childIds = [];
      }
      renderNode.__renderProps = item.props;
      renderNode.__styleNode = styleNode;
      const extendId = item.extension?.extendId || item.id;
      const isExtend = !!(extendPageNodeMap && extendPageNodeMap[extendId]);
      const hasCondition = withCondition(renderNode, pageContent.content.relation, extendContent?.content?.relation);
      const hasVariable = withVariable(renderNode, pageContent.content.relation, extendContent?.content?.relation);
      const isBlockRootNode = item.name === BLOCK_COMPONENT_NAME && item.id === rootNode?.id;
      renderNode.__editorConfig = {
        visible: item.name !== BLANK_NODE,
        showInStructure: !templateNode && item.name !== STYLE_CONTAINER && item.name !== PAGE_COMPONENT_NAME && !isBlockRootNode,
        editable: !templateNode,
        moveable: !item.extension?.extendId && !extendPageNodeMap[item.id],
        directiveable: false,
        styleable: !!styleNode,
        isExtend,
        isExtendAndModified: !!item.extension?.extendId && item.name !== BLANK_NODE,
        isExtendAndDeleted: isExtend && item.name === BLANK_NODE,
        hasCondition,
        hasVariable,
        hasMock: mockEnable && !!idMockMap[item.id]
      };

      if (mockEnable) {
        const mockNode = (getNodeMock(item, { idMockMap }) || initMockNode(item)) as RenderStructureNode;
        mockNode.__editorConfig = {
          editable: true,
        };
        renderNode.__mock = mockNode;
      }

      list.push(renderNode);
    });
    return list;
  }

  return doFormat(schemas);
};

const prepareTemplate = (templates: Content[] = []) => {
  let map = {} as Record<string, StructureNode>;
  templates.forEach((item) => {
    const result = structureToNodeMap(item.schemas);
    map = { ...map, ...result };
  });
  return { nodeMap: map };
};

const preparePage = (page: PageContent) => {
  let map = {} as Record<string, StructureNode>;
  map = structureToNodeMap(page.content?.schemas || []);
  return { nodeMap: map };
};

const prepareMock = (mocks: Mock[] = []) => {
  let idMap = {} as Record<string, StructureNode>;
  mocks.forEach((item) => {
    item.schemas?.forEach((node) => {
      if (node.id) {
        idMap[node.id] = node;
      }
    });
  });
  return { idMap };
};

const getNodeMock = (node: StructureNode, opt: Pick<FormatSchemasOptions, 'idMockMap'>) => {
  const { id } = node;
  const idMock = opt.idMockMap[id];
  return idMock;
};

const componentsMap = (components: Component[] = []) => {
  const map: FormatSchemasOptions['componentMap'] = {};
  components.forEach((item) => {
    map[item.name] = item;
  });
  return { componentMap: map };
};
