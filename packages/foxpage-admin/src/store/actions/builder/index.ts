import { createAction } from 'typesafe-actions';

export const setFrameWin = createAction('BUILDER__SET_FRAME_WIN', (win: Window) => ({
  win,
}))();
