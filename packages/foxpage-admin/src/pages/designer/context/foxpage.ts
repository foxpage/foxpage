import React, { useContext } from 'react';

import {
  Component,
  ComponentSourceMap,
  DesignerI18n,
  FoxBuilderEvents,
  InitStateParams,
  LoadedComponents,
  PageContent,
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
  foxI18n: DesignerI18n;
  renderDSL: RenderStructure;
  pageStructure: RenderStructure;
  structureList?: RenderStructureNode[];
  config: VisualEditorConfig;
  components: Component[];
  componentMap: ComponentSourceMap;
  loadedComponents: LoadedComponents;
  selectNode?: RenderStructureNode;
  selectNodeFrom?: 'viewer' | 'sider';
  rootNode?: RenderStructureNode | null;
  events: FoxBuilderEvents;
  nodeChangedStatus: {};
  visualFrameSrc?: string;
  structureMap: { [key in string]: RenderStructureNode };
  dataLoaded: boolean;
  pageNode?: RenderStructureNode;
  contentId?: string;
  parseState?: {
    parseKey: string;
    page: PageContent | null;
    opt: InitStateParams | null;
  };
  slug: string;
  extra: Record<string, any>;
}

const context = React.createContext<FoxPageContext>({
  foxI18n: {} as DesignerI18n,
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
    onFrameLoaded: () => {},
    onCopyToClipboard: () => {},
    onPasteFromClipboard: () => {},
  },
  nodeChangedStatus: {},
  structureMap: {},
  dataLoaded: false,
  parseState: {
    parseKey: '',
    page: null,
    opt: null,
  },
  slug: '',
  extra: {},
});

export const FoxPageContext = context;
export const useFoxpageContext = () => useContext(FoxPageContext);
