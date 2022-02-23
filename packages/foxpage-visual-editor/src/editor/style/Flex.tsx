import React from 'react';

import { Input, InputNumber, Radio, Select, Tooltip } from 'antd';

import { Col, RadioButton, Row } from './Common';
import { FlexType } from './index.d';

const { Option } = Select;

const Flex: React.FC<FlexType> = props => {
  const { flex, flexBasis, flexShrink, flexGrow, onChange = (key: string, val: string) => {} } = props;
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title="flex-basis">flex-basis</Tooltip>
        </Col>
        <Col sm={18}>
          <Input
            addonAfter="px"
            value={flexBasis?.replace('px', '')}
            placeholder="size"
            onChange={(e: any) => {
              onChange('flexBasis', `${e.target.value}px`);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title="flex-shrink">flex-shrink</Tooltip>
        </Col>
        <Col sm={18}>
          <InputNumber
            style={{ width: '100%' }}
            value={flexShrink}
            onChange={(value: string) => {
              onChange('flexShrink', value);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title="flex-grow">flex-grow</Tooltip>
        </Col>
        <Col sm={18}>
          <InputNumber
            style={{ width: '100%' }}
            value={flexGrow}
            onChange={(value: string) => {
              onChange('flexGrow', value);
            }}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Flex;
