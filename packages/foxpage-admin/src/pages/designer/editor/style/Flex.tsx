import React from 'react';

import { Input, InputNumber, Tooltip } from 'antd';

import { Col, Row } from './Common';
import { FlexType } from './interface';

const Flex: React.FC<FlexType> = (props) => {
  const { flexBasis, flexShrink, flexGrow, onChange } = props;
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
              if (typeof onChange === 'function') onChange('flexBasis', `${e.target.value}px`);
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
            onChange={(value) => {
              if (typeof onChange === 'function' && value) onChange('flexShrink', value);
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
            onChange={(value: string | null) => {
              if (typeof onChange === 'function' && value) onChange('flexGrow', value);
            }}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Flex;
