import { FoxBuilderEvents } from '@/types/index';

import * as ACTIONS from './actions';

/**
 * poster
 * @param type action
 * @param data data info
 */
export const poster = (type: string, data: any, frame = window.parent) => {
  // console.log('[ POSTER ]',type, data);
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