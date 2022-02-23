interface CommonType {
  onChange?(key: string, val: string | number): void;
  onApplyState?(key: string, val: string | number): void;
}
interface DisplayType extends CommonType {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
}

interface BoxType extends CommonType {
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
}

interface FontType extends CommonType {
  fontWeight?: string;
  fontSize?: string;
  color?: string;
  lineHeight?: number | string;
  opacity?: number;
  textAlign?: string;
  verticalAlign?: string;
}

interface PositionType extends CommonType {
  position?: string;
  zIndex?: string;
  float?: string;
  clear?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

interface BackgroundType extends CommonType {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPositionX?: string;
  backgroundPositionY?: string;
  backgroundRepeat?: string;
}

interface BorderType extends CommonType {
  borderRadius?: string;
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: string;
}

interface ShadowType extends CommonType {
  boxShadow?: string;
}

interface ShadowType extends CommonType {
  boxShadow?: string;
}

interface FlexType extends CommonType {
  flex?: string;
  flexBasis?: string;
  flexShrink?: string;
  flexGrow?: string;
}

interface StyleType extends DisplayType, FontType {}

export { DisplayType, BoxType, FontType, PositionType, StyleType, BackgroundType, BorderType, ShadowType, FlexType };
