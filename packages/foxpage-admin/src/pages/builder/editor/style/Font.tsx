import React from 'react';

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { Input, Radio, Select, Slider, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

import { Col, colorPickerStyle, Label, RadioButton, Row } from './Common';
import { FontType } from './index.d';

const { Option } = Select;
const Font: React.FC<FontType> = props => {
  const {
    textAlign,
    verticalAlign,
    fontSize,
    fontWeight,
    opacity,
    color,
    onChange = (_val: number | string) => {},
    onApplyState = (_key: string, _val: string) => {},
  } = props;
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Label>weight：</Label>
        </Col>
        <Col sm={9}>
          <Tooltip title="fontWeight">
            <Select
              size="small"
              value={fontWeight}
              style={{ width: 90 }}
              onChange={(value: any) => {
                onChange('fontWeight', value);
                onApplyState('fontWeight', value);
              }}
            >
              <Option value="normal">Normal</Option>
              <Option value="bold">Bold</Option>
              <Option value="lighter">Lighter</Option>
            </Select>
          </Tooltip>
        </Col>
        <Col sm={9}>
          <Tooltip title="fontSize">
            <Input
              size="small"
              addonAfter="px"
              value={fontSize ? fontSize.replace('px', '') : ''}
              placeholder="size"
              onChange={(e: any) => {
                onChange('fontSize', `${e.target.value}px`);
              }}
              onBlur={(e: any) => {
                onApplyState('fontSize', `${e.target.value}px`);
              }}
            />
          </Tooltip>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>color：</Label>
        </Col>
        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { color },
              propChange: (_prop: string, val: string) => {
                onChange('color', val);
                onApplyState('color', val);
              },
              applyState: () => {},
              propsChange: () => {},
            }}
          >
            <ColorPicker propKey="color" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>opacity：</Label>
        </Col>
        <Col sm={18}>
          <Slider
            value={opacity ? opacity : 1}
            style={{ width: '100%' }}
            step={0.01}
            max={1}
            onChange={(value: any) => {
              onChange('opacity', value);
              onApplyState('opacity', value);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>align：</Label>
        </Col>
        <Col sm={18}>
          <Radio.Group
            size="small"
            value={textAlign}
            style={{ width: '100%' }}
            onChange={(e: any) => {
              onChange('textAlign', e.target.value);
              onApplyState('textAlign', e.target.value);
            }}
          >
            <Tooltip title="text-align:left">
              <RadioButton style={{ width: '33.3%' }} value="left">
                <AlignRightOutlined />
              </RadioButton>
            </Tooltip>

            <Tooltip title="text-align:center">
              <RadioButton style={{ width: '33.3%' }} value="center">
                <AlignCenterOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title="text-align:right">
              <RadioButton style={{ width: '33.3%' }} value="right">
                <AlignLeftOutlined />
              </RadioButton>
            </Tooltip>
          </Radio.Group>
        </Col>
      </Row>
      <Row>
        <Col sm={18} offset="6">
          <Radio.Group
            size="small"
            value={verticalAlign}
            style={{ width: '100%' }}
            onChange={(e: any) => {
              onChange('verticalAlign', e.target.value);
              onApplyState('verticalAlign', e.target.value);
            }}
          >
            <Tooltip title="vertical-align:top">
              <RadioButton style={{ width: '33.3%' }} value="top">
                <VerticalAlignTopOutlined />
              </RadioButton>
            </Tooltip>

            <Tooltip title="vertical-align:bottom">
              <RadioButton style={{ width: '33.3%' }} value="bottom">
                <VerticalAlignBottomOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title="vertical-align:center">
              <RadioButton style={{ width: '33.3%' }} value="center">
                <VerticalAlignMiddleOutlined />
              </RadioButton>
            </Tooltip>
          </Radio.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Font;
