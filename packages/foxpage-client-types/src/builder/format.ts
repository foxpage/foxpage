import { Component } from '../component';

import { PageContent } from './content';
import { RelationDetails, RenderStructureNode, StructureNode } from './structure';

export type FormattedData = {
  formattedSchemas: RenderStructureNode[];
  templateNodeMap: Record<string, StructureNode>;
  extendPageNodeMap: Record<string, StructureNode>;
  originPageNodeMap: Record<string, StructureNode>;
  idMockMap: Record<string, StructureNode>;
  componentMap: Record<string, Component>;
  relations?: RelationDetails;
  blockNodeMap: Record<string, StructureNode>;
  mergedContent?: PageContent;
};
