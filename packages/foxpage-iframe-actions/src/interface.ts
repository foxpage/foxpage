import {
  ComponentSourceMap,
  DragData,
  PageContent,
  RenderStructureNode,
  VisualEditorConfig,
} from '@foxpage/foxpage-client-types';
import { BrowserStructure } from '@foxpage/foxpage-types';

export enum ACTIONS {
  DSL_CHANGED = 'DSL_CHANGED',
  SELECT_NODE = 'SELECT_NODE',
  OUTER_SELECT_NODE = 'OUTER_SELECT_NODE',
  POST_SELECT_NODE_RECT = 'POST_SELECT_NODE_RECT',
  DROP_COMPONENT = 'DROP_COMPONENT',
  DROP_COMPONENT_RECEIVED = 'DROP_COMPONENT_RECEIVED',
  DRAG_OVER_COMPONENT = 'DRAG_OVER_COMPONENT',
  DRAG_OVER_COMPONENT_RECEIVED = 'DRAG_OVER_COMPONENT_RECEIVED',
  FRAME_LOADED = 'FRAME_LOADED',
  POST_INIT_DATA = 'POST_INIT_DATA',
  INITIATED = 'INITIATED',
  ZOOM_CHANGED = 'ZOOM_CHANGED',
  FRAME_READY = 'FRAME_READY',
  PAGE_CAPTURE = 'PAGE_CAPTURE',
  PAGE_CAPTURED = 'PAGE_CAPTURED',
  PAGE_PARSE = 'PAGE_PARSE',
}

export interface ListenerHandlers {
  handleSelectNode?: (node: BrowserStructure) => void;
  handleDSLChange?: (dsl: RenderStructureNode[]) => void;
  handlePostNodeRect?: (rect: DOMRect) => void;
  handleDropComponent?: (data: { node: string; position: [number, number] }) => void;
  handleDropReceived?: (dragData: DragData) => void;
  handleDragOver?: (position: [number, number]) => void;
  handleDragOverReceived?: (data: { node: any; placement: string }) => void;
  handleFrameLoaded?: () => void;
  handleOutSelectNode?: (node: RenderStructureNode) => void;
  handlePageCapture?: (versionId: string) => void;
  handlePageCaptured?: (data: string, versionId: string) => void;
  handlePostInitData?: (data: {
    zoom: number;
    componentMap: ComponentSourceMap;
    rootNode?: RenderStructureNode | null;
    config?: VisualEditorConfig;
    extra?: Record<string, any>;
  }) => void;
  handleInitiated?: (pageId: string) => void;
  handleZoomChange?: (zoom: number) => void;
  handleFrameReady?: (pageId: string) => void;
  handlePageParse?: (data: { page: PageContent; opt: any; slug: string }) => void;
}
