import React, { useContext } from 'react';

import { Input, Select, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

import viewerContext from '../../viewerContext';

import { Col, colorPickerStyle, Label, Row } from './Common';
import { BorderType } from './index.d';

const { Option } = Select;

const Border: React.FC<BorderType> = props => {
  const {
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    onChange = (_key: string, _val: string) => {},
    onApplyState = (_key: string, _val: string) => {},
  } = props;
  const { foxpageI18n } = useContext(viewerContext);
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxpageI18n.borderRadius}>
            <Label>{foxpageI18n.radius}：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Tooltip title={foxpageI18n.borderRadius}>
            <Input
              size="small"
              value={borderRadius?.replace('px', '')}
              addonAfter="px"
              onChange={(e: any) => {
                onChange('borderRadius', `${e.target.value}px`);
              }}
              onBlur={(e: any) => {
                onApplyState('borderRadius', `${e.target.value}px`);
              }}
            />
          </Tooltip>
        </Col>
      </Row>

      <Row>
        <Col sm={6}>
          <Tooltip title={foxpageI18n.borderColor}>
            <Label>{foxpageI18n.color}：</Label>
          </Tooltip>
        </Col>

        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { borderColor },
              propChange: (_prop: string, val: string) => {
                onChange('borderColor', val);
              },
              applyState: (_e: any) => {
                onApplyState('borderColor', borderColor as string);
              },
              propsChange: () => {},
            }}
          >
            <ColorPicker propKey="borderColor" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxpageI18n.borderStyle}>
            <Label>{foxpageI18n.style}：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Select
            size="small"
            value={borderStyle}
            style={{ width: '100%' }}
            onChange={(value: any) => {
              onChange('borderStyle', value);
              onApplyState('borderStyle', value);
            }}
          >
            <Option value="none">{foxpageI18n.borderStyleNone}</Option>
            <Option value="solid">{foxpageI18n.borderStyleSolid}</Option>
            <Option value="dashed">{foxpageI18n.borderStyleDashed}</Option>
            <Option value="dotted">{foxpageI18n.borderStyleDotted}</Option>
          </Select>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxpageI18n.borderWidth}>
            <Label>{foxpageI18n.width}：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Tooltip title={foxpageI18n.borderWidth}>
            <Input
              size="small"
              value={borderWidth?.replace('px', '')}
              addonAfter="px"
              onChange={(e: any) => {
                onChange('borderWidth', `${e.target.value}px`);
              }}
              onBlur={(e: any) => {
                onApplyState('borderWidth', `${e.target.value}px`);
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Border;
