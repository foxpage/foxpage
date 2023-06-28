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
import { Radio, Tooltip } from 'antd';

import { useFoxpageContext } from '../../context';

import { Col, Label, RadioButton, Row } from './Common';
import { DisplayType } from './interface';

const Display: React.FC<DisplayType> = (props) => {
  const {
    display,
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    onChange = (_key: string, _val: string, _autoSave?: boolean) => {},
  } = props;
  const { foxI18n } = useFoxpageContext();
  return (
    <React.Fragment>
      <Row style={{ marginTop: 0 }}>
        <Col sm={6}>
          <Label>{foxI18n.displayLabel}: </Label>
        </Col>
        <Col sm={18}>
          <Radio.Group
            size="small"
            value={display}
            style={{ width: '100%' }}
            onChange={(e: any) => {
              onChange('display', e.target.value, true);
            }}>
            {/* <Tooltip title="inline">
              <RadioButton style={{ width: '20%' }} value="inline">
                <PicCenterOutlined />
              </RadioButton>
            </Tooltip> */}

            <Tooltip title={foxI18n.displayFlex}>
              <RadioButton style={{ width: '25%' }} value="flex">
                <GroupOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title={foxI18n.displayBlock}>
              <RadioButton style={{ width: '25%' }} value="block">
                <OneToOneOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title={foxI18n.displayInlineBlock}>
              <RadioButton style={{ width: '25%' }} value="inline-block">
                <PauseOutlined />
              </RadioButton>
            </Tooltip>
            <Tooltip title={foxI18n.displayNone}>
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
              <Label>{foxI18n.flexDirection}: </Label>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={flexDirection}
                onChange={(e: any) => {
                  onChange('flexDirection', e.target.value, true);
                }}>
                <Tooltip title={foxI18n.flexDirectionRow}>
                  <RadioButton value="row" style={{ width: '25%' }}>
                    <ArrowRightOutlined />
                  </RadioButton>
                </Tooltip>

                <Tooltip title={foxI18n.flexDirectionRowReverse}>
                  <RadioButton value="row-reverse" style={{ width: '25%' }}>
                    <ArrowLeftOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.flexDirectionColumn}>
                  <RadioButton value="column" style={{ width: '25%' }}>
                    <ArrowDownOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.flexDirectionColumnReverse}>
                  <RadioButton value="column-reverse" style={{ width: '25%' }}>
                    <ArrowUpOutlined />
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Label>{foxI18n.flexJustifyContent}: </Label>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={justifyContent}
                onChange={(e: any) => {
                  onChange('justifyContent', e.target.value, true);
                }}>
                <Tooltip title={foxI18n.justifyContentFlexStart}>
                  <RadioButton value="flex-start" style={{ width: '20%' }}>
                    <PicLeftOutlined />
                  </RadioButton>
                </Tooltip>

                <Tooltip title={foxI18n.justifyContentFlexEnd}>
                  <RadioButton value="flex-end" style={{ width: '20%' }}>
                    <PicRightOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.justifyContentFlexCenter}>
                  <RadioButton value="center" style={{ width: '20%' }}>
                    <PicCenterOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.justifyContentSpaceBetween}>
                  <RadioButton value="space-between" style={{ width: '20%' }}>
                    <OneToOneOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.justifyContentSpaceAround}>
                  <RadioButton value="space-around" style={{ width: '20%' }}>
                    <MergeCellsOutlined />
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Label>{foxI18n.flexAlignItems}: </Label>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={alignItems}
                onChange={(e: any) => {
                  onChange('alignItems', e.target.value, true);
                }}>
                <Tooltip title={foxI18n.alignItemsFlexStart}>
                  <RadioButton value="flex-start" style={{ width: '20%' }}>
                    <VerticalAlignTopOutlined />
                  </RadioButton>
                </Tooltip>

                <Tooltip title={foxI18n.alignItemsFlexEnd}>
                  <RadioButton value="flex-end" style={{ width: '20%' }}>
                    <VerticalAlignBottomOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.alignItemsFlexCenter}>
                  <RadioButton value="center" style={{ width: '20%' }}>
                    <VerticalAlignMiddleOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.baseline}>
                  <RadioButton value="baseline" style={{ width: '20%' }}>
                    <MenuOutlined />
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.stretch}>
                  <RadioButton value="stretch" style={{ width: '20%' }}>
                    <BarcodeOutlined />
                  </RadioButton>
                </Tooltip>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Label>{foxI18n.flexWrap}: </Label>
            </Col>
            <Col sm={18}>
              <Radio.Group
                size="small"
                style={{ width: '100%' }}
                value={flexWrap}
                onChange={(e: any) => {
                  onChange('flexWrap', e.target.value, true);
                }}>
                <Tooltip title={foxI18n.nowrap}>
                  <RadioButton value="nowrap" style={{ width: '33.3%' }}>
                    <span>nowrap</span>
                  </RadioButton>
                </Tooltip>

                <Tooltip title={foxI18n.wrap}>
                  <RadioButton value="wrap" style={{ width: '33.3%' }}>
                    <span>wrap</span>
                  </RadioButton>
                </Tooltip>
                <Tooltip title={foxI18n.reverse}>
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
