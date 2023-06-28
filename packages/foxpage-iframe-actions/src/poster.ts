import {
  ComponentSourceMap,
  DragData,
  PageContent,
  RenderStructureNode,
  VisualEditorConfig,
} from '@foxpage/foxpage-client-types';

import { ACTIONS } from './interface';

/**
 * poster
 * @param type action
 * @param data data info
 */
export const poster = (type: string, data: any, frame = window.parent) => {
  frame.postMessage(
    {
      data,
      type,
    },
    '*', // TODO: need improve security
  );
};

export const framePoster = (type: string, data: any) => {
  const frame = window.document.getElementById('component-viewer') as HTMLIFrameElement;
  if (frame) {
    frame.contentWindow?.postMessage(
      {
        data,
        type,
      },
      '*',
    );
  }
};

// child to parent
export const handleSelectNode = (node: RenderStructureNode) => {
  poster(ACTIONS.SELECT_NODE, node);
};

export const handlePostNodeRect = (rect: DOMRect) => {
  poster(ACTIONS.POST_SELECT_NODE_RECT, rect);
};

export const handleDropReceived = (dndInfo: any) => {
  poster(ACTIONS.DROP_COMPONENT_RECEIVED, dndInfo);
};
export const handleDragOverReceived = (dragData: DragData) => {
  poster(ACTIONS.DRAG_OVER_COMPONENT_RECEIVED, dragData);
};

export const handleFrameLoaded = () => {
  poster(ACTIONS.FRAME_LOADED, {});
};

export const handleInitiated = (pageId: string) => {
  poster(ACTIONS.INITIATED, { pageId });
};

export const handleFrameReady = (pageId: string) => {
  poster(ACTIONS.FRAME_READY, { pageId });
};

export const handlePageCaptured = (data: string, versionId: string) => {
  poster(ACTIONS.PAGE_CAPTURED, { img: data, versionId });
};

// parent to child
export const handleDropComponent = (node: string, position: [number, number]) => {
  framePoster(ACTIONS.DROP_COMPONENT, { node, position });
};

export const handleDragOver = (position: [number, number]) => {
  framePoster(ACTIONS.DRAG_OVER_COMPONENT, position);
};

export const handleDSLChange = (dsl: RenderStructureNode[]) => {
  framePoster(ACTIONS.DSL_CHANGED, dsl);
};

export const handleOutSelectNode = (node: RenderStructureNode) => {
  framePoster(ACTIONS.OUTER_SELECT_NODE, node);
};

export const handlePostInitData = (data: {
  zoom: number;
  componentMap: ComponentSourceMap;
  rootNode?: RenderStructureNode | null;
  config?: VisualEditorConfig;
  extra?: Record<string, any>;
}) => {
  framePoster(ACTIONS.POST_INIT_DATA, data);
};

export const handleZoomChange = (zoom: number) => {
  framePoster(ACTIONS.ZOOM_CHANGED, zoom);
};

export const handlePageCapture = (versionId: string) => {
  framePoster(ACTIONS.PAGE_CAPTURE, versionId);
};

export const handlePageParse = (page: PageContent, opt: any, slug: string) => {
  framePoster(ACTIONS.PAGE_PARSE, { page, opt, slug });
};
