import { BuilderWindow, BuilderWindowChangeOptions, FoxBuilderEvents } from '@/types/index';

import * as ACTIONS from './actions';

const call = (fn: any, ...data: any[]) => {
  if (typeof fn === 'function') {
    fn(...data);
  }
};

/**
 * listener
 * @param event listener
 */
export const listener = (event: MessageEvent, handlers: FoxBuilderEvents) => {
  const { type, data } = event.data || {};

  switch (type) {
    case ACTIONS.INIT: {
      call(handlers.onInit, data);
      break;
    }
    case ACTIONS.CHANGE: {
      call(handlers.onChange, data);
      break;
    }
    case ACTIONS.SELECT_COMPONENT: {
      call(handlers.onSelectComponent, data);
      break;
    }
    case ACTIONS.UPDATE_COMPONENT: {
      call(handlers.onUpdateComponent, data);
      break;
    }
    case ACTIONS.REMOVE_COMPONENT: {
      call(handlers.onRemoveComponent, data);
      break;
    }
    case ACTIONS.COPY_COMPONENT: {
      call(handlers.onCopyComponent, data);
      break;
    }
    case ACTIONS.DROP_COMPONENT: {
      call(handlers.onDropComponent, data);
      break;
    }
    case ACTIONS.WINDOW_CHANGE: {
      const { target, opt } = data as { target: BuilderWindow; opt?: BuilderWindowChangeOptions };
      call(handlers.onWindowChange, target, opt);
      break;
    }
    case ACTIONS.LINK_JUMP: {
      const { target, opt } = data as { target: string; opt?: {} };
      call(handlers.onLinkChange, target, opt);
      break;
    }
    case ACTIONS.FRAME_LOADED: {
      const { opt } = data as { opt?: {} };
      call(handlers.onFrameLoaded, opt);
      break;
    }
    case ACTIONS.PAGE_CAPTURE: {
      const { opt } = data as { opt?: {} };
      call(handlers.onPageCapture, opt);
      break;
    }
    case ACTIONS.PAGE_CAPTURED: {
      const { opt } = data as { opt?: {} };
      call(handlers.onPageCaptured, opt);
      break;
    }
    case ACTIONS.STRUCTURE_CHANGED: {
      const { opt } = data as { opt?: {} };
      call(handlers.onStructureChanged, opt);
      break;
    }
    case ACTIONS.RENDER_DSL_CHANGED: {
      call(handlers.onRenderDSLChanged, data);
      break;
    }
    case ACTIONS.PAGE_STRUCTURE_CHANGED: {
      call(handlers.onPageStructureChanged, data);
      break;
    }
    case ACTIONS.SELECT_COMPONENT_CHANGED: {
      call(handlers.onSelectedComponentChanged, data);
      break;
    }
    case ACTIONS.FETCH_COMPONENT_VERSIONS: {
      call(handlers.onFetchComponentVersions, data);
      break;
    }
    default:
      break;
  }
};
