import React from 'react';

import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BarcodeOutlined,
  EyeInvisibleOutlined,
  GroupOutlined,
  MenuOutlined,
  MergeCellsOutlined,
  OneToOneOutlined,
  PauseOutlined,
  PicCenterOutlined,
  PicLeftOutlined,
  PicRightOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { Radio, Select, Tooltip } from 'antd';

import { Col, Label, RadioButton, Row } from './Common';
import { DisplayType } from './index.d';

const { Option } = Select;

const Display: React.FC<DisplayType> = props => {
  const {
    display,
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    onChange = (key: string, val: string) => {},
    onApplyState = (key: string, val: string) => {},
  } = props;
  return (
    <React.Fragment>
      <Row style={{ marginTop: 0 }}>
        <Col sm={6}>
          <Tooltip title="display">
            <Label>display：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <Radio.Group
            size="small"
            value={display}
            style={{ width: '100%' }}
            onChange={(e: any) => {
              onChange('display', e.target.value);
              onApplyState('display', e.target.value);
            }}
          >
            {/* <Tooltip title="inline">
              <RadioButton style={{ width: '20%' }} value="inline">
                <PicCenterOutlined />
              </RadioButton>
            </Tooltip> */}

            <Tooltip title="flex">
              <RadioButton style={{ width: '25%' }} value="flex">
                <GroupOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title="block">
              <RadioButton style={{ width: '25%' }} value="block">
                <OneToOneOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title="inline-block">
              <RadioButton style={{ width: '25%' }} value="inline-block">
                <PauseOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title="none">
              <RadioButton style={{ width: '25%' }} value="none">
                <EyeInvisibleOutlined />
              </RadioButton>
            </Tooltip>
          </Radio.Group>
        </Col>
      </Row>
      {display === 'flex' && (
        <React.Fragment>
          <Row>
            <Col sm={6}>
              <Tooltip title="flex-direction">
                <Label>direction：</Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={flexDirection}
                onChange={(e: any) => {
                  onChange('flexDirection', e.target.value);
                  onApplyState('flexDirection', e.target.value);
                }}
              >
                <Tooltip title="row">
                  <RadioButton value="row" style={{ width: '25%' }}>
                    <ArrowRightOutlined />
                  </RadioButton>
                </Tooltip>

                <Tooltip title="row-reverse">
                  <RadioButton value="row-reverse" style={{ width: '25%' }}>
                    <ArrowLeftOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="column">
                  <RadioButton value="column" style={{ width: '25%' }}>
                    <ArrowDownOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="column-reverse">
                  <RadioButton value="column-reverse" style={{ width: '25%' }}>
                    <ArrowUpOutlined />
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title="justify-content">
                <Label>align：</Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={justifyContent}
                onChange={(e: any) => {
                  onChange('justifyContent', e.target.value);
                  onApplyState('justifyContent', e.target.value);
                }}
              >
                <Tooltip title="flex-start">
                  <RadioButton value="flex-start" style={{ width: '20%' }}>
                    <PicLeftOutlined />
                  </RadioButton>
                </Tooltip>

                <Tooltip title="flex-end">
                  <RadioButton value="flex-end" style={{ width: '20%' }}>
                    <PicRightOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="center">
                  <RadioButton value="center" style={{ width: '20%' }}>
                    <PicCenterOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="space-between">
                  <RadioButton value="space-between" style={{ width: '20%' }}>
                    <OneToOneOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="space-around">
                  <RadioButton value="space-around" style={{ width: '20%' }}>
                    <MergeCellsOutlined />
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title="align-items">
                <Label>alignItems：</Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={alignItems}
                onChange={(e: any) => {
                  onChange('alignItems', e.target.value);
                  onApplyState('alignItems', e.target.value);
                }}
              >
                <Tooltip title="flex-start">
                  <RadioButton value="flex-start" style={{ width: '20%' }}>
                    <VerticalAlignTopOutlined />
                  </RadioButton>
                </Tooltip>

                <Tooltip title="flex-end">
                  <RadioButton value="flex-end" style={{ width: '20%' }}>
                    <VerticalAlignBottomOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="center">
                  <RadioButton value="center" style={{ width: '20%' }}>
                    <VerticalAlignMiddleOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="baseline">
                  <RadioButton value="baseline" style={{ width: '20%' }}>
                    <MenuOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title="stretch">
                  <RadioButton value="stretch" style={{ width: '20%' }}>
                    <BarcodeOutlined />
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title="flex-wrap">
                <Label>flexWrap：</Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={flexWrap}
                onChange={(e: any) => {
                  onChange('flexWrap', e.target.value);
                  onApplyState('flexWrap', e.target.value);
                }}
              >
                <Tooltip title="flex-start">
                  <RadioButton value="flex-start" style={{ width: '33.3%' }}>
                    <span>nowrap</span>
                  </RadioButton>
                </Tooltip>

                <Tooltip title="flex-end">
                  <RadioButton value="flex-end" style={{ width: '33.3%' }}>
                    <span>wrap</span>
                  </RadioButton>
                </Tooltip>
                <Tooltip title="wrap-reverse">
                  <RadioButton value="wrap-reverse" style={{ width: '33.3%' }}>
                    <span>reverse</span>
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
export default Display;
