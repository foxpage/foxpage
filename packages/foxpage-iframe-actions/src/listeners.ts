import { ACTIONS, ListenerHandlers } from './interface';

const call = (fn: any, ...data: any[]) => {
  if (typeof fn === 'function') {
    fn(...data);
  }
};

/**
 * listener
 * @param event listener
 */
export const listener = (event: MessageEvent, handlers: ListenerHandlers) => {
  const { type, data } = event.data || {};
  switch (type) {
    case ACTIONS.SELECT_NODE: {
      call(handlers.handleSelectNode, data);
      break;
    }
    case ACTIONS.OUTER_SELECT_NODE: {
      call(handlers.handleOutSelectNode, data);
      break;
    }
    case ACTIONS.DSL_CHANGED: {
      call(handlers.handleDSLChange, data);
      break;
    }
    case ACTIONS.DRAG_OVER_COMPONENT: {
      call(handlers.handleDragOver, data);
      break;
    }
    case ACTIONS.DROP_COMPONENT: {
      call(handlers.handleDropComponent, data);
      break;
    }
    case ACTIONS.DROP_COMPONENT_RECEIVED: {
      call(handlers.handleDropReceived, data);
      break;
    }
    case ACTIONS.FRAME_LOADED: {
      call(handlers.handleFrameLoaded, data);
      break;
    }
    case ACTIONS.POST_SELECT_NODE_RECT: {
      call(handlers.handlePostNodeRect, data);
      break;
    }
    case ACTIONS.DRAG_OVER_COMPONENT_RECEIVED: {
      call(handlers.handleDragOverReceived, data);
      break;
    }
    case ACTIONS.POST_INIT_DATA: {
      call(handlers.handlePostInitData, data);
      break;
    }
    case ACTIONS.INITIATED: {
      call(handlers.handleInitiated, data);
      break;
    }
    case ACTIONS.ZOOM_CHANGED: {
      call(handlers.handleZoomChange, data);
      break;
    }
    case ACTIONS.FRAME_READY: {
      call(handlers.handleFrameReady, data);
      break;
    }
    case ACTIONS.PAGE_CAPTURE: {
      call(handlers.handlePageCapture, data);
      break;
    }
    case ACTIONS.PAGE_CAPTURED: {
      call(handlers.handlePageCaptured, data);
      break;
    }
    case ACTIONS.PAGE_PARSE: {
      call(handlers.handlePageParse, data);
    }

    default:
      break;
  }
};
