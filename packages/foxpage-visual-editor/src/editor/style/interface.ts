export interface CommonType {
  onChange?(key: string, val: string | number): void;
  onApplyState(): void;
}
export interface DisplayType extends CommonType {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
}

export interface BoxType extends CommonType {
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
}

export interface FontType extends CommonType {
  fontWeight?: string;
  fontSize?: string;
  color?: string;
  lineHeight?: number | string;
  opacity?: number;
  textAlign?: string;
  verticalAlign?: string;
}

export interface PositionType extends CommonType {
  position?: string;
  zIndex?: string;
  float?: string;
  clear?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export interface BackgroundType extends CommonType {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPositionX?: string;
  backgroundPositionY?: string;
  backgroundRepeat?: string;
}

export interface BorderType extends CommonType {
  borderRadius?: string;
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: string;
}

export interface ShadowType extends CommonType {
  boxShadow?: string;
}

export interface ShadowType extends CommonType {
  boxShadow?: string;
}

export interface FlexType extends CommonType {
  flex?: string;
  flexBasis?: string;
  flexShrink?: string;
  flexGrow?: string;
}

export interface StyleType extends DisplayType, FontType {}
