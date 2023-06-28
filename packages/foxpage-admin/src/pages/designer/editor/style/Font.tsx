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

import { useFoxpageContext } from '../../context';

import { Col, colorPickerStyle, Label, RadioButton, Row } from './Common';
import { FontType } from './interface';

const { Option } = Select;
const Font: React.FC<FontType> = (props) => {
  const {
    textAlign,
    verticalAlign,
    fontSize,
    fontWeight,
    opacity,
    color,
    onChange = (_key: string, _val: number | string, _autoSave?: boolean) => {},
    onApplyState = () => {},
  } = props;
  const { foxI18n } = useFoxpageContext();
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Label>{foxI18n.fontWeightLabel}: </Label>
        </Col>
        <Col sm={9}>
          <Select
            size="small"
            value={fontWeight}
            style={{ width: 90 }}
            onChange={(value: any) => {
              onChange('fontWeight', value, true);
            }}>
            <Option value="normal">{foxI18n.normal}</Option>
            <Option value="bold">{foxI18n.bold}</Option>
            <Option value="lighter">{foxI18n.lighter}</Option>
          </Select>
        </Col>
        <Col sm={9}>
          <Tooltip title={foxI18n.fontSize}>
            <Input
              size="small"
              addonAfter="px"
              value={fontSize ? fontSize.replace('px', '') : ''}
              placeholder={foxI18n.fontSize}
              onChange={(e: any) => {
                onChange('fontSize', `${e.target.value}px`);
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
          <Label>{foxI18n.color}: </Label>
        </Col>
        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { color },
              propChange: (_prop: string, val: any) => {
                onChange('color', val, true);
              },
              applyState: () => {},
              propsChange: () => {},
              onBindVariable: () => {},
            }}>
            <ColorPicker propKey="color" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>{foxI18n.opacity}: </Label>
        </Col>
        <Col sm={18}>
          <Slider
            value={opacity ? opacity : 1}
            style={{ width: '100%' }}
            step={0.01}
            max={1}
            onChange={(value: any) => {
              onChange('opacity', value, true);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>{foxI18n.align}: </Label>
        </Col>
        <Col sm={18}>
          <Radio.Group
            size="small"
            value={textAlign}
            style={{ width: '100%' }}
            onChange={(e: any) => {
              onChange('textAlign', e.target.value, true);
            }}>
            <Tooltip title={`${foxI18n.textAlign}:${foxI18n.left}`}>
              <RadioButton style={{ width: '33.3%' }} value="left">
                <AlignRightOutlined />
              </RadioButton>
            </Tooltip>

            <Tooltip title={`${foxI18n.textAlign}:${foxI18n.center}`}>
              <RadioButton style={{ width: '33.3%' }} value="center">
                <AlignCenterOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title={`${foxI18n.textAlign}:${foxI18n.right}`}>
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
              onChange('verticalAlign', e.target.value, true);
            }}>
            <Tooltip title={`${foxI18n.verticalAlign}:${foxI18n.top}`}>
              <RadioButton style={{ width: '33.3%' }} value="top">
                <VerticalAlignTopOutlined />
              </RadioButton>
            </Tooltip>

            <Tooltip title={`${foxI18n.verticalAlign}:${foxI18n.bottom}`}>
              <RadioButton style={{ width: '33.3%' }} value="bottom">
                <VerticalAlignBottomOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title={`${foxI18n.verticalAlign}:${foxI18n.center}`}>
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
