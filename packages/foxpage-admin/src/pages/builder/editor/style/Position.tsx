import React, { useState } from 'react';

import { Input, InputNumber, Select as AntdSelect, Tooltip } from 'antd';
import styled from 'styled-components';

import { Col, Label, Row } from './Common';
import { PositionType } from './index.d';

const { Option } = AntdSelect;

const Select = styled(AntdSelect)`
  .ant-select-selector {
    padding: 0 8px !important;
  }
  .ant-select-selection-item {
    padding-right: 14px !important;
  }
`;

const Position: React.FC<PositionType> = props => {
  const {
    position,
    zIndex,
    float,
    clear,
    top,
    bottom,
    left,
    right,
    onChange = (_val: number | string) => {},
    onApplyState = (_key: string, _val: string) => {},
  } = props;
  const [topUnit, setTopUnit] = useState<string>(top && top.includes('%') ? '%' : 'px');
  const [leftUnit, setLeftUnit] = useState<string>(left && left.includes('%') ? '%' : 'px');
  const [rightUnit, setRightUnit] = useState<string>(right && right.includes('%') ? '%' : 'px');
  const [bottomUnit, setBottomUnit] = useState<string>(bottom && bottom.includes('%') ? '%' : 'px');
  const positionOption = (
    <React.Fragment>
      <Option value="px">px</Option>
      <Option value="%">%</Option>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Label>position：</Label>
        </Col>
        <Col sm={18}>
          <AntdSelect
            value={position}
            size="small"
            style={{ width: '100%' }}
            onChange={(value: string) => {
              onChange('position', value);
              onApplyState('position', value);
            }}
          >
            <Option value="static">Static</Option>
            <Option value="relative">Relative</Option>
            <Option value="absolute">Absolute</Option>
            <Option value="fixed">Fixed</Option>
          </AntdSelect>
        </Col>
      </Row>
      {position !== 'static' && (
        <React.Fragment>
          <Row>
            <Col sm={9} offset={6}>
              <Tooltip title="top">
                <Input
                  size="small"
                  style={{ width: '97%' }}
                  addonAfter={
                    <Select
                      value={topUnit}
                      onChange={(value: string) => {
                        setTopUnit(value);
                        if (top) {
                          onChange('top', `${top.replace(/px|%/g, '')}${value}`);
                          onApplyState('top', `${top.replace(/px|%/g, '')}${value}`);
                        }
                      }}
                    >
                      {positionOption}
                    </Select>
                  }
                  value={top ? top.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('top', `${e.target.value}${topUnit || 'px'}`);
                  }}
                  onBlur={(e: any) => {
                    onApplyState('top', `${e.target.value}${topUnit || 'px'}`);
                  }}
                />
              </Tooltip>
            </Col>
            <Col sm={9}>
              <Tooltip title="left">
                <Input
                  style={{ width: '97%', marginLeft: '3%' }}
                  size="small"
                  addonAfter={
                    <Select
                      value={leftUnit}
                      onChange={(value: string) => {
                        setLeftUnit(value);
                        if (left) {
                          onChange('left', `${left.replace(/px|%/g, '')}${value}`);
                          onApplyState('left', `${left.replace(/px|%/g, '')}${value}`);
                        }
                      }}
                    >
                      {positionOption}
                    </Select>
                  }
                  value={left ? left.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('left', `${e.target.value}${leftUnit || 'px'}`);
                  }}
                  onBlur={(e: any) => {
                    onApplyState('left', `${e.target.value}${leftUnit || 'px'}`);
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col sm={9} offset={6}>
              <Tooltip title="bottom">
                <Input
                  style={{ width: '97%' }}
                  size="small"
                  addonAfter={
                    <Select
                      value={bottomUnit}
                      size="small"
                      onChange={(value: string) => {
                        setBottomUnit(value);
                        if (bottom) {
                          onChange('bottom', `${bottom.replace(/px|%/g, '')}${value}`);
                          onApplyState('bottom', `${bottom.replace(/px|%/g, '')}${value}`);
                        }
                      }}
                    >
                      {positionOption}
                    </Select>
                  }
                  value={bottom ? bottom.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('bottom', `${e.target.value}${bottomUnit || 'px'}`);
                  }}
                  onBlur={(e: any) => {
                    onApplyState('bottom', `${e.target.value}${bottomUnit || 'px'}`);
                  }}
                />
              </Tooltip>
            </Col>
            <Col sm={9}>
              <Tooltip title="right">
                <Input
                  size="small"
                  style={{ width: '97%', marginLeft: '3%' }}
                  addonAfter={
                    <Select
                      value={rightUnit}
                      onChange={(value: string) => {
                        setRightUnit(value);
                        if (right) {
                          onChange('right', `${right.replace(/px|%/g, '')}${value}`);
                          onApplyState('right', `${right.replace(/px|%/g, '')}${value}`);
                        }
                      }}
                    >
                      {positionOption}
                    </Select>
                  }
                  value={right ? right.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('right', `${e.target.value}${rightUnit || 'px'}`);
                  }}
                  onBlur={(e: any) => {
                    onApplyState('right', `${e.target.value}${rightUnit || 'px'}`);
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
        </React.Fragment>
      )}
      <Row>
        <Col sm={6}>
          <Label>float：</Label>
        </Col>
        <Col sm={18}>
          <AntdSelect
            size="small"
            value={float}
            style={{ width: '100%' }}
            onChange={(value: any) => {
              onChange('float', value);
              onApplyState('float', value);
            }}
          >
            <Option value="none">None</Option>
            <Option value="left">Left</Option>
            <Option value="right">Right</Option>
          </AntdSelect>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>clear：</Label>
        </Col>
        <Col sm={18}>
          <AntdSelect
            size="small"
            value={clear}
            style={{ width: '100%' }}
            onChange={(value: string) => {
              onChange('clear', value);
              onApplyState('clear', value);
            }}
          >
            <Option value="none">None</Option>
            <Option value="left">Left</Option>
            <Option value="right">Right</Option>
            <Option value="both">Both</Option>
          </AntdSelect>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>z-index：</Label>
        </Col>
        <Col sm={18}>
          <InputNumber
            style={{ width: '100%' }}
            size="small"
            value={zIndex}
            onChange={(value: string) => {
              onChange('zIndex', value);
            }}
            onBlur={(e: any) => {
              onApplyState('zIndex', e.target.value);
            }}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Position;
