import React from 'react';

import { Input, Select, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

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
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title="borderRadius">
            <Label>radius：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Tooltip title="borderRadius">
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
          <Tooltip title="borderColor">
            <Label>color：</Label>
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
          <Tooltip title="borderStyle">
            <Label>style：</Label>
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
            <Option value="none">none</Option>
            <Option value="solid">solid</Option>
            <Option value="double">double</Option>
            <Option value="dashed">dashed</Option>
            <Option value="dotted">dotted</Option>
          </Select>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title="borderWidth">
            <Label>width：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Tooltip title="borderWidth">
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
