import React from 'react';

import {
  Component,
  ComponentMap,
  FoxBuilderEvents,
  FoxI18n,
  LoadedComponents,
  RenderStructure,
  RenderStructureNode,
  VisualEditorConfig,
} from '@/types/index';

/**
 * foxpage context
 * the stable context
 * only updated from root portal
 */
export interface FoxPageContext {
  foxI18n: FoxI18n;
  renderDSL: RenderStructure;
  pageStructure: RenderStructure;
  structureList?: RenderStructureNode[];
  config: VisualEditorConfig;
  components: Component[];
  componentMap: ComponentMap;
  loadedComponents: LoadedComponents;
  selectNode?: RenderStructureNode | null;
  rootNode?: RenderStructureNode | null;
  events: FoxBuilderEvents;
  reRendering?: boolean;
  nodeChangedStatus: {};
}

const context = React.createContext<FoxPageContext>({
  foxI18n: {} as FoxI18n,
  renderDSL: [],
  pageStructure: [],
  config: {
    sys: {},
    page: {},
  },
  components: [],
  componentMap: {},
  loadedComponents: {},
  events: {
    onSelectComponent: () => {},
  },
  nodeChangedStatus: {},
});

export default context;
