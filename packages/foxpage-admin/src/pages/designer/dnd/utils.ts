import { DragInfo } from '@/types/index';

/**
 * init drag data
 * @param type drag type
 * @param value drag data
 */
export const initDragInfo = (type: DragInfo['type'], value: DragInfo['detail']) => {
  return { type, detail: value };
};

export const initDropInfo = () => {};

export const initDndInfo = () => {};
