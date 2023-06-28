import { createContext, Dispatch, DragEventHandler, SetStateAction, useContext } from 'react';

import { DragData } from '@/types/index';

import { defaultAction } from './constant';

export interface DndContext {
  isDragging: boolean;
  inDropZone: boolean;
  placeholder?: DragData;
  handleDragStart: DragEventHandler<HTMLDivElement>;
  handleDragOver: (position: [number, number]) => void;
  handleDrop: (data: string, position: [number, number]) => void;
  handleDragEnd: DragEventHandler<HTMLDivElement>;
  handleDragLeave: DragEventHandler<HTMLDivElement>;
  handleDragEnter: () => void;
  handlePlaceholder: (placeholder: DragData) => void;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
}

const context = createContext<DndContext>({
  isDragging: false,
  inDropZone: false,
  handleDragStart: defaultAction,
  handleDragOver: defaultAction,
  handleDrop: defaultAction,
  handleDragEnd: defaultAction,
  handleDragLeave: defaultAction,
  handleDragEnter: defaultAction,
  handlePlaceholder: defaultAction,
  setIsDragging: defaultAction,
});

export const DndContext = context;
export const useDndContext = () => useContext<DndContext>(DndContext);
