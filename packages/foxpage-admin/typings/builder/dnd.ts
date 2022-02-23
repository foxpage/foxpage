export interface DndInfoType {
  hoverComponentId?: string;
  parentId?: string;
  componentId?: string;
  destIndex?: number;
  pos?: number;
  method?: string;
  rect: RectType;
}

export interface RectType {
  height: number;
  width: number;
  top: number;
  left: number;
  bottom?: number;
}

export interface Drop {
  componentNode: Element;
  parentNode: Element;
  pos: string;
}
