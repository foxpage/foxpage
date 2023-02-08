import { FoxBuilderEvents } from '@/types/index';

import * as ACTIONS from './actions';

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

/**
 * iframe poster
 * @param type
 * @param data
 */
export const framePoster = (type: string, data: any) => {
  // @ts-ignore
  const frameWin = document.getElementById('main-view')?.contentWindow;
  if (frameWin) {
    poster(type, data, frameWin);
  }
};

/**
 * init data
 * @param data init data
 */
export const handleInit: FoxBuilderEvents['onInit'] = (data) => {
  framePoster(ACTIONS.INIT, data);
};

/**
 * change data
 * @param data changed data
 */
export const handleChange: FoxBuilderEvents['onChange'] = (data) => {
  framePoster(ACTIONS.CHANGE, data);
};

/**
 * select component handler
 * @param component selected component(structure node)
 */
export const handleSelectComponent: FoxBuilderEvents['onSelectComponent'] = (component) => {
  poster(ACTIONS.SELECT_COMPONENT, component);
};

/**
 * update component handler
 * @param component new update component
 */
export const handleUpdateComponent: FoxBuilderEvents['onUpdateComponent'] = (component) => {
  poster(ACTIONS.UPDATE_COMPONENT, component);
};

/**
 * remove component handler
 * @param component component info
 */
export const handleRemoveComponent: FoxBuilderEvents['onRemoveComponent'] = (component) => {
  poster(ACTIONS.REMOVE_COMPONENT, component);
};

/**
 * copy component handler
 * @param component component info
 */
export const handleCopyComponent: FoxBuilderEvents['onCopyComponent'] = (component) => {
  poster(ACTIONS.COPY_COMPONENT, component);
};

/**
 * drop component handler
 * @param dndInfo dnd info
 */
export const handleDropComponent: FoxBuilderEvents['onDropComponent'] = (dndInfo) => {
  poster(ACTIONS.DROP_COMPONENT, dndInfo);
};

/**
 * bind condition handler
 * @param target window target
 * @param opt options
 */
export const handleWindowChange: FoxBuilderEvents['onWindowChange'] = (target, opt) => {
  poster(ACTIONS.WINDOW_CHANGE, { target, opt });
};

/**
 * handle link jump
 * for iframe emit root to link jump
 * @param target jump target
 * @param opt
 */
export const handleLinkChange: FoxBuilderEvents['onLinkChange'] = (target, opt) => {
  poster(ACTIONS.LINK_JUMP, { target, opt });
};

/**
 * on
 * @param opt loaded options
 */
export const handleFrameLoaded: FoxBuilderEvents['onFrameLoaded'] = (opt) => {
  poster(ACTIONS.FRAME_LOADED, { opt });
};

/**
 * capture page
 * @param data
 */
export const handlePageCapture: FoxBuilderEvents['onPageCapture'] = () => {
  framePoster(ACTIONS.PAGE_CAPTURE, {});
};

/**
 * captured page
 * @param data
 */
export const handlePageCaptured: FoxBuilderEvents['onPageCaptured'] = (opt) => {
  poster(ACTIONS.PAGE_CAPTURED, { opt });
};

/**
 * structure changed
 * @param data
 */
export const handleStructureChanged: FoxBuilderEvents['onStructureChanged'] = (opt) => {
  framePoster(ACTIONS.STRUCTURE_CHANGED, { opt });
};


/**
 * handle render DSL changed
 * @param data
 */
export const handleRenderDSLChanged: FoxBuilderEvents['onRenderDSLChanged'] = (data) => {
  framePoster(ACTIONS.RENDER_DSL_CHANGED, data);
};

/**
 * handle pageStructure changed
 * @param data page structure
 */
export const handlePageStructureChanged: FoxBuilderEvents['onPageStructureChanged'] = (data) => {
  framePoster(ACTIONS.PAGE_STRUCTURE_CHANGED, data);
};

/**
 * handle elected component changed
 * @param data selected component
 */
export const handleSelectComponentChanged: FoxBuilderEvents['onSelectedComponentChanged'] = (data) => {
  framePoster(ACTIONS.SELECT_COMPONENT_CHANGED, data);
};

/**
 * handle elected component changed
 * @param data selected component
 */
 export const handleFetchComponentVersions: FoxBuilderEvents['onFetchComponentVersions'] = (data) => {
  poster(ACTIONS.FETCH_COMPONENT_VERSIONS, data);
};
