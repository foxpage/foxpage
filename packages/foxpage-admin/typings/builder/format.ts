import { Component } from '../component';

import { RenderStructureNode, StructureNode } from './structure';

export type FormattedData = {
  formattedSchemas: RenderStructureNode[];
  templateNodeMap: Record<string, StructureNode>;
  extendPageNodeMap: Record<string, StructureNode>;
  originPageNodeMap: Record<string, StructureNode>;
  idMockMap: Record<string, StructureNode>;
  componentMap: Record<string, Component>;
};
