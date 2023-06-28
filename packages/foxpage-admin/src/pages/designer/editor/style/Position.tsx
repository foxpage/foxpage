import React, { useState } from 'react';

import { Input, InputNumber, Select as AntdSelect, Tooltip } from 'antd';
import styled from 'styled-components';

import { useFoxpageContext } from '../../context';

import { Col, Label, Row } from './Common';
import { PositionType } from './interface';

const { Option } = AntdSelect;

const Select = styled(AntdSelect)`
  .ant-select-selector {
    padding: 0 8px !important;
  }
  .ant-select-selection-item {
    padding-right: 14px !important;
  }
`;

const Position: React.FC<PositionType> = (props) => {
  const {
    position,
    zIndex,
    float,
    clear,
    top,
    bottom,
    left,
    right,
    onChange = (_key: string, _val: number | string, _autoSave?: boolean) => {},
    onApplyState = () => {},
  } = props;
  const { foxI18n } = useFoxpageContext();
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
          <Label>{foxI18n.position}: </Label>
        </Col>
        <Col sm={18}>
          <AntdSelect
            value={position}
            size="small"
            style={{ width: '100%' }}
            onChange={(value: string) => {
              onChange('position', value, true);
            }}>
            <Option value="static">{foxI18n.static}</Option>
            <Option value="relative">{foxI18n.relative}</Option>
            <Option value="absolute">{foxI18n.absolute}</Option>
            <Option value="fixed">{foxI18n.fixed}</Option>
          </AntdSelect>
        </Col>
      </Row>
      {position !== 'static' && (
        <React.Fragment>
          <Row>
            <Col sm={9} offset={6}>
              <Tooltip title={foxI18n.top}>
                <Input
                  size="small"
                  style={{ width: '97%' }}
                  addonAfter={
                    <Select
                      value={topUnit}
                      // @ts-ignore
                      onChange={(value: string) => {
                        setTopUnit(value);
                        if (top) {
                          onChange('top', `${top.replace(/px|%/g, '')}${value}`, true);
                        }
                      }}>
                      {positionOption}
                    </Select>
                  }
                  value={top ? top.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('top', `${e.target.value}${topUnit || 'px'}`);
                  }}
                  onBlur={() => {
                    onApplyState();
                  }}
                />
              </Tooltip>
            </Col>
            <Col sm={9}>
              <Tooltip title={foxI18n.left}>
                <Input
                  style={{ width: '97%', marginLeft: '3%' }}
                  size="small"
                  addonAfter={
                    <Select
                      value={leftUnit}
                      // @ts-ignore
                      onChange={(value: string) => {
                        setLeftUnit(value);
                        if (left) {
                          onChange('left', `${left.replace(/px|%/g, '')}${value}`, true);
                        }
                      }}>
                      {positionOption}
                    </Select>
                  }
                  value={left ? left.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('left', `${e.target.value}${leftUnit || 'px'}`);
                  }}
                  onBlur={() => {
                    onApplyState();
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col sm={9} offset={6}>
              <Tooltip title={foxI18n.bottom}>
                <Input
                  style={{ width: '97%' }}
                  size="small"
                  addonAfter={
                    <Select
                      value={bottomUnit}
                      size="small"
                      // @ts-ignore
                      onChange={(value: string) => {
                        setBottomUnit(value);
                        if (bottom) {
                          onChange('bottom', `${bottom.replace(/px|%/g, '')}${value}`, true);
                        }
                      }}>
                      {positionOption}
                    </Select>
                  }
                  value={bottom ? bottom.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('bottom', `${e.target.value}${bottomUnit || 'px'}`);
                  }}
                  onBlur={() => {
                    onApplyState();
                  }}
                />
              </Tooltip>
            </Col>
            <Col sm={9}>
              <Tooltip title={foxI18n.right}>
                <Input
                  size="small"
                  style={{ width: '97%', marginLeft: '3%' }}
                  addonAfter={
                    <Select
                      value={rightUnit}
                      // @ts-ignore
                      onChange={(value: string) => {
                        setRightUnit(value);
                        if (right) {
                          onChange('right', `${right.replace(/px|%/g, '')}${value}`, true);
                        }
                      }}>
                      {positionOption}
                    </Select>
                  }
                  value={right ? right.replace(/px|%/g, '') : undefined}
                  onChange={(e: any) => {
                    onChange('right', `${e.target.value}${rightUnit || 'px'}`);
                  }}
                  onBlur={() => {
                    onApplyState();
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
        </React.Fragment>
      )}
      <Row>
        <Col sm={6}>
          <Label>{foxI18n.float}: </Label>
        </Col>
        <Col sm={18}>
          <AntdSelect
            size="small"
            value={float}
            style={{ width: '100%' }}
            onChange={(value: any) => {
              onChange('float', value, true);
            }}>
            <Option value="none">{foxI18n.none}</Option>
            <Option value="left">{foxI18n.left}</Option>
            <Option value="right">{foxI18n.right}</Option>
          </AntdSelect>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>{foxI18n.clear}: </Label>
        </Col>
        <Col sm={18}>
          <AntdSelect
            size="small"
            value={clear}
            style={{ width: '100%' }}
            onChange={(value: string) => {
              onChange('clear', value, true);
            }}>
            <Option value="none">{foxI18n.none}</Option>
            <Option value="left">{foxI18n.left}</Option>
            <Option value="right">{foxI18n.right}</Option>
            <Option value="both">{foxI18n.both}</Option>
          </AntdSelect>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>{foxI18n.zIndex}: </Label>
        </Col>
        <Col sm={18}>
          <InputNumber
            style={{ width: '100%' }}
            size="small"
            value={zIndex}
            onChange={(value) => {
              if (value) onChange('zIndex', value);
            }}
            onBlur={() => {
              onApplyState();
            }}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Position;
