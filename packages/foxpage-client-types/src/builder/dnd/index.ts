import { Component } from '../../component';
import { RenderStructureNode, StructureNode } from '../structure';

export interface DndInfo {
  hoverComponentId?: string;
  parentId?: string;
  componentId?: string;
  destIndex?: number;
  pos?: number;
  method?: string;
  rect?: RectInfo;
}

export interface RectInfo {
  height: number;
  width: number;
  top: number;
  left: number;
  bottom?: number;
}

// will remove
export interface DropInfo {
  componentNode: Element;
  parentNode: Element;
  pos: string;
}

export interface DragInfo {
  type: 'add' | 'move';
  detail: RenderStructureNode | StructureNode[] | Component;
}

export interface DndData {
  placement: 'before' | 'after' | 'in';
  dragInfo?: DragInfo | null;
  dropIn?: RenderStructureNode | null;
  dropInId?: string;
  noUpdate?: boolean;
  clientY?: number;
}

export interface DragData {
  placement: 'before' | 'after' | 'in';
  rect: DOMRect;
}
