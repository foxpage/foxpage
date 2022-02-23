export interface ComponentResource {
  host: string;
  path: string;
}

export interface ComponentSourceType {
  entry: {
    browser: ComponentResource;
    node: ComponentResource;
    debug?: ComponentResource;
    css?: ComponentResource;
  };
  dependencies: Array<{ id: string; name: string }>;
  'editor-entry': Array<{ id: string; name: string; version?: string }>;
}

export interface ComponentMetaType {
  notRender?: boolean;
  decorated?: boolean;
}

export interface ComponentType {
  id?: string;
  name?: string;
  meta?: ComponentMetaType;
  schema?: string;
  type?: string;
  version?: string;
  resource?: ComponentSourceType;
  useStyleEditor?: boolean;
  enableChildren?: boolean;
  components?: ComponentType[];
}

export interface ComponentSourceMapType {
  [name: string]: ComponentType;
}

export interface ComponentSchemaType {
  required: string[];
  properties: {
    [key: string]: {
      type: string;
      description?: string;
    };
  };
}

export interface ComponentDirectiveType {
  [name: string]: string | Array<string> | undefined;
}

export interface ComponentPropsType {
  [name: string]: string | ComponentPropsType;
}

export interface RelationType {
  [name: string]: {
    id: string;
    name?: string;
    type: 'template' | 'variable' | 'condition' | 'sys_variable';
    content?: ComponentStructure;
  };
}

export interface ComponentStructure {
  id: string;
  parentId?: string;
  version?: string;
  name: string;
  label?: string;
  type: string;
  meta?: ComponentMetaType;
  wrapper?: string;
  children: Array<ComponentStructure>;
  resource?: ComponentSourceType;
  schema?: ComponentSchemaType;
  meta?: string;
  position?: number;
  relation?: RelationType;
  props?: ComponentPropsType;
  directive?: ComponentDirectiveType;
  isUpdate?: boolean;
  belongTemplate?: boolean;
  useStyleEditor?: boolean;
  enableChildren?: boolean;
}

export interface ComponentAddParams {
  type: 'insert' | 'append';
  componentId: string;
  pos: string;
  desc: ComponentStructure;
  parentId: string;
}

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

export interface OffsetType {
  scrollX: number;
  scrollY: number;
}

export interface FoxpageI18n {
  basic: string;
  directive: string;
  props: string;
  listener: string;
  style: string;
  version: string;
  name: string;
  label: string;
  padding: string;
  margin: string;
  font: string;
  fontWeight: string;
  fontSize: string;
  color: string;
  opacity: string;
  align: string;
  textAlign: string;
  verticalAlign: string;
  left: string;
  center: string;
  right: string;
  top: string;
  middle: string;
  bottom: string;
  normal: string;
  bold: string;
  lighter: string;
  position: string;
  static: string;
  relative: string;
  absolute: string;
  fixed: string;
  float: string;
  clear: string;
  none: string;
  both: string;
  zIndex: string;
  background: string;
  backgroundColor: string;
  image: string;
  backgroundImage: string;
  border: string;
  radius: string;
  borderRadius: string;
  borderColor: string;
  borderStyle: string;
  borderStyleNone: string;
  borderStyleSolid: string;
  borderStyleDashed: string;
  borderStyleDotted: string;
  borderWidth: string;
  width: string;
  shadow: string;
  shadowType: string;
  shadowTypeOutset: string;
  shadowTypeInset: string;
  shadowX: string;
  shadowY: string;
  shadowBlur: string;
  shadowSpeed: string;
  box: string;
  display: string;
  displayLabel: string;
  displayFlex: string;
  displayBlock: string;
  displayInlineBlock: string;
  displayNone: string;
  flexDirection: string;
  flexDirectionRow: string;
  flexDirectionColumn: string;
  flexDirectionRowReverse: string;
  flexDirectionColumnReverse: string;
  flexJustifyContent: string;
  justifyContentFlexStart: string;
  justifyContentFlexCenter: string;
  justifyContentFlexEnd: string;
  justifyContentSpaceBetween: string;
  justifyContentSpaceAround: string;
  flexAlignItems: string;
  baseline: string;
  stretch: string;
  alignItemsFlexStart: string;
  alignItemsFlexCenter: string;
  alignItemsFlexEnd: string;
  flexWrap: string;
  nowrap: string;
  wrap: string;
  reverse: string;
  fontWeightLabel: string;
  noEditor: string;
  noListener: string;
  backgroundSize: string;
  backgroundSizeLabel: string;
  backgroundSizeDefault: string;
  backgroundSizeContain: string;
  backgroundSizeCover: string;
  backgroundRepeat: string;
  backgroundRepeatLabel: string;
  backgroundRepeatDefault: string;
  backgroundRepeatX: string;
  backgroundRepeatY: string;
  backgroundNoRepeat: string;
  backgroundPosition: string;
  backgroundPositionLabel: string;
  x: string;
  y: string;
  backgroundPositionXLabel: string;
  backgroundPositionYLabel: string;
  jumpTemplateTip: string;
  deleteComponentTip: string;
  copyComponentTip: string;
  yes: string;
  no: string;
}