import React, { useContext } from 'react';

import { Input, Select, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

import viewerContext from '../../viewerContext';

import { Col, colorPickerStyle, Label, Row } from './Common';
import { BackgroundType } from './index.d';

const { Option } = Select;

const Background: React.FC<BackgroundType> = props => {
  const {
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundPositionX,
    backgroundPositionY,
    backgroundRepeat,
    onChange = (_key: string, _val: string) => {},
    onApplyState = (_key: string, _val: string) => {},
  } = props;
  const { foxpageI18n } = useContext(viewerContext);
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxpageI18n.backgroundColor}>
            <Label>{foxpageI18n.color}：</Label>
          </Tooltip>
        </Col>
        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { backgroundColor },
              propChange: (_prop: string, val: string) => {
                onChange('backgroundColor', val);
              },
              applyState: () => {
                onApplyState('backgroundColor', backgroundColor as string);
              },
              propsChange: () => {},
            }}
          >
            <ColorPicker propKey="backgroundColor" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Tooltip title={foxpageI18n.backgroundImage}>
            <Label>{foxpageI18n.image}：</Label>
          </Tooltip>
        </Col>

        <Col sm={18}>
          <Tooltip title={foxpageI18n.backgroundImage}>
            <Input
              size="small"
              value={backgroundImage?.replace(/url\(|\)/g, '')}
              placeholder={foxpageI18n.backgroundImage}
              onChange={(e: any) => {
                onChange('backgroundImage', `url(${e.target.value})`);
              }}
              onBlur={(e: any) => {
                onApplyState('backgroundImage', `url(${e.target.value})`);
              }}
            />
          </Tooltip>
        </Col>
      </Row>
      {backgroundImage && backgroundImage !== '' && (
        <React.Fragment>
          <Row>
            <Col sm={6}>
              <Tooltip title={foxpageI18n.backgroundSize}>
                <Label>{foxpageI18n.backgroundSizeLabel}：</Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Select
                size="small"
                value={backgroundSize}
                style={{ width: '100%' }}
                onChange={(value: any) => {
                  onChange('backgroundSize', value);
                  onApplyState('backgroundSize', value);
                }}
              >
                <Option value="default">{foxpageI18n.backgroundSizeDefault}</Option>
                <Option value="contain">{foxpageI18n.backgroundSizeContain}</Option>
                <Option value="cover">{foxpageI18n.backgroundSizeCover}</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title={foxpageI18n.backgroundRepeat}>
                <Label>{foxpageI18n.backgroundRepeatLabel}：</Label>
              </Tooltip>
            </Col>
            <Col sm={18}>
              <Select
                size="small"
                value={backgroundRepeat}
                style={{ width: '100%' }}
                onChange={(value: any) => {
                  onChange('backgroundRepeat', value);
                  onApplyState('backgroundRepeat', value);
                }}
              >
                <Option value="repeat">{foxpageI18n.backgroundRepeatDefault}</Option>
                <Option value="repeat-x">{foxpageI18n.backgroundRepeatX}</Option>
                <Option value="repeat-y">{foxpageI18n.backgroundRepeatY}</Option>
                <Option value="no-repeat">{foxpageI18n.backgroundNoRepeat}</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title={foxpageI18n.backgroundPosition}>
                <Label>{foxpageI18n.backgroundPositionLabel}：</Label>
              </Tooltip>
            </Col>

            <Col sm={9}>
              <Tooltip title={foxpageI18n.backgroundPositionXLabel}>
                <Input
                  value={backgroundPositionX}
                  placeholder={foxpageI18n.x}
                  addonAfter="px"
                  onChange={(e: any) => {
                    onChange('backgroundPositionX', e.target.value);
                  }}
                  onBlur={(e: any) => {
                    onApplyState('backgroundPositionX', e.target.value);
                  }}
                />
              </Tooltip>
            </Col>
            <Col sm={9}>
              <Tooltip title={foxpageI18n.backgroundPositionYLabel}>
                <Input
                  style={{ marginLeft: '3%' }}
                  value={backgroundPositionY}
                  placeholder={foxpageI18n.x}
                  addonAfter="px"
                  onChange={(e: any) => {
                    onChange('backgroundPositionY', e.target.value);
                  }}
                  onBlur={(e: any) => {
                    onApplyState('backgroundPositionY', e.target.value);
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
