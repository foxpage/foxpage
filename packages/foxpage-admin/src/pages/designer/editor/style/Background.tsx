import React from 'react';

import { Input, Select, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

import { useFoxpageContext } from '../../context';

import { Col, colorPickerStyle, Label, Row } from './Common';
import { BackgroundType } from './interface';

const { Option } = Select;

const Background: React.FC<BackgroundType> = (props) => {
  const {
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundPositionX,
    backgroundPositionY,
    backgroundRepeat,
    onChange = (_key: string, _val: string, _autoSave?: boolean) => {},
    onApplyState = () => {},
  } = props;
  const { foxI18n } = useFoxpageContext();
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxI18n.backgroundColor}>
            <Label>{foxI18n.color}: </Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { backgroundColor },
              propChange: (_prop: string, val: any) => {
                onChange('backgroundColor', val, true);
              },
              applyState: () => {},
              propsChange: () => {},
              onBindVariable: () => {},
            }}>
            <ColorPicker propKey="backgroundColor" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxI18n.backgroundImage}>
            <Label>{foxI18n.image}: </Label>
          </Tooltip>
        </Col>

        <Col sm={18}>
          <Tooltip title={foxI18n.backgroundImage}>
            <Input
              size="small"
              value={backgroundImage?.replace(/url\(|\)/g, '')}
              placeholder={foxI18n.backgroundImage}
              onChange={(e: any) => {
                onChange('backgroundImage', `url(${e.target.value})`);
              }}
              onBlur={() => {
                onApplyState();
              }}
            />
          </Tooltip>
        </Col>
      </Row>
      {backgroundImage && backgroundImage !== '' && (
        <React.Fragment>
          <Row>
            <Col sm={6}>
              <Tooltip title={foxI18n.backgroundSize}>
                <Label>{foxI18n.backgroundSizeLabel}: </Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Select
                size="small"
                value={backgroundSize}
                style={{ width: '100%' }}
                onChange={(value: any) => {
                  onChange('backgroundSize', value, true);
                }}>
                <Option value="default">{foxI18n.backgroundSizeDefault}</Option>
                <Option value="contain">{foxI18n.backgroundSizeContain}</Option>
                <Option value="cover">{foxI18n.backgroundSizeCover}</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title={foxI18n.backgroundRepeat}>
                <Label>{foxI18n.backgroundRepeatLabel}: </Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Select
                size="small"
                value={backgroundRepeat}
                style={{ width: '100%' }}
                onChange={(value: any) => {
                  onChange('backgroundRepeat', value, true);
                }}>
                <Option value="repeat">{foxI18n.backgroundRepeatDefault}</Option>
                <Option value="repeat-x">{foxI18n.backgroundRepeatX}</Option>
                <Option value="repeat-y">{foxI18n.backgroundRepeatY}</Option>
                <Option value="no-repeat">{foxI18n.backgroundNoRepeat}</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title={foxI18n.backgroundPosition}>
                <Label>{foxI18n.backgroundPositionLabel}: </Label>
              </Tooltip>
            </Col>

            <Col sm={9}>
              <Tooltip title={foxI18n.backgroundPositionXLabel}>
                <Input
                  value={backgroundPositionX}
                  placeholder={foxI18n.x}
                  addonAfter="px"
                  onChange={(e: any) => {
                    onChange('backgroundPositionX', e.target.value);
                  }}
                  onBlur={() => {
                    onApplyState();
                  }}
                />
              </Tooltip>
            </Col>
            <Col sm={9}>
              <Tooltip title={foxI18n.backgroundPositionYLabel}>
                <Input
                  style={{ marginLeft: '3%' }}
                  value={backgroundPositionY}
                  placeholder={foxI18n.x}
                  addonAfter="px"
                  onChange={(e: any) => {
                    onChange('backgroundPositionY', e.target.value);
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
    </React.Fragment>
  );
};
export default Background;
