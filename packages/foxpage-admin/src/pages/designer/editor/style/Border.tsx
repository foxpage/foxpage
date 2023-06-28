import React from 'react';

import { Input, Select, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

import { useFoxpageContext } from '../../context';

import { Col, colorPickerStyle, Label, Row } from './Common';
import { BorderType } from './interface';

const { Option } = Select;

const Border: React.FC<BorderType> = (props) => {
  const {
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    onChange = (_key: string, _val: string, _autoSave?: boolean) => {},
    onApplyState = () => {},
  } = props;
  const { foxI18n } = useFoxpageContext();
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxI18n.borderRadius}>
            <Label>{foxI18n.radius}: </Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Tooltip title={foxI18n.borderRadius}>
            <Input
              size="small"
              value={borderRadius?.replace('px', '')}
              addonAfter="px"
              onChange={(e: any) => {
                onChange('borderRadius', `${e.target.value}px`);
              }}
              onBlur={() => {
                onApplyState();
              }}
            />
          </Tooltip>
        </Col>
      </Row>

      <Row>
        <Col sm={6}>
          <Tooltip title={foxI18n.borderColor}>
            <Label>{foxI18n.color}: </Label>
          </Tooltip>
        </Col>

        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { borderColor },
              propChange: (_prop: string, val: any) => {
                onChange('borderColor', val, true);
              },
              applyState: () => {},
              propsChange: () => {},
              onBindVariable: () => {},
            }}>
            <ColorPicker propKey="borderColor" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxI18n.borderStyle}>
            <Label>{foxI18n.style}: </Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Select
            size="small"
            value={borderStyle}
            style={{ width: '100%' }}
            onChange={(value: any) => {
              onChange('borderStyle', value, true);
            }}>
            <Option value="none">{foxI18n.borderStyleNone}</Option>
            <Option value="solid">{foxI18n.borderStyleSolid}</Option>
            <Option value="dashed">{foxI18n.borderStyleDashed}</Option>
            <Option value="dotted">{foxI18n.borderStyleDotted}</Option>
          </Select>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxI18n.borderWidth}>
            <Label>{foxI18n.width}: </Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Tooltip title={foxI18n.borderWidth}>
            <Input
              size="small"
              value={borderWidth?.replace('px', '')}
              addonAfter="px"
              onChange={(e: any) => {
                onChange('borderWidth', `${e.target.value}px`);
              }}
              onBlur={() => {
                onApplyState();
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Border;
