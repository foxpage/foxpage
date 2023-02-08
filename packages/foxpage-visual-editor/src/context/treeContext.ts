import React, { Dispatch, DragEventHandler, SetStateAction } from 'react';

import { DndData, RenderStructureNode } from '@foxpage/foxpage-admin';

interface StructureTreeContext {
  dragId: string;
  dndInfo?: DndData | null;
  isDragging: boolean;
  scTop: number;
  computedScrollTop: number;
  onScroll: (scrollTop: number) => void;
  onDragStart: (ev: React.DragEvent, node: RenderStructureNode) => void;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
  onDragEnd: (restDragId?: boolean) => void;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onExpand: Dispatch<SetStateAction<string[]>>;
  onSelect: ((component: any, opt?: { from: 'viewer' | 'sider' } | undefined) => void) | undefined;
}

const context = React.createContext<StructureTreeContext>({
  dragId: '',
  isDragging: false,
  scTop: 0,
  computedScrollTop: 0,
  onScroll: () => {},
  onDragStart: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onDragEnd: () => {},
  onDragLeave: () => {},
  onExpand: () => {},
  onSelect: () => {},
});

export default context;
