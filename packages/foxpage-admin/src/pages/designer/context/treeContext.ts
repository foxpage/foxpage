import React, { Dispatch, DragEventHandler, SetStateAction } from 'react';

import { DndData, RenderStructureNode } from '@/types/index';

import { defaultAction } from './constant';

interface StructureTreeContext {
  dragId: string;
  dndInfo?: DndData | null;
  isDragging: boolean;
  scTop: number;
  computedScrollTop: number;
  searchValue: string;
  onScroll: (scrollTop: number) => void;
  onDragStart: (ev: React.DragEvent, node: RenderStructureNode) => void;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
  onDragEnd: (restDragId?: boolean) => void;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onExpand: Dispatch<SetStateAction<string[]>>;
  onSelect: ((component: any, from: 'viewer' | 'sider') => void) | undefined;
  onSearch: (v: string) => void;
}

const context = React.createContext<StructureTreeContext>({
  dragId: '',
  isDragging: false,
  scTop: 0,
  computedScrollTop: 0,
  searchValue: '',
  onScroll: defaultAction,
  onDragStart: defaultAction,
  onDragOver: defaultAction,
  onDrop: defaultAction,
  onDragEnd: defaultAction,
  onDragLeave: defaultAction,
  onExpand: defaultAction,
  onSelect: defaultAction,
  onSearch: defaultAction,
});

export default context;
