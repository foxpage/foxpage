import React from 'react';

import { Input, Select, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

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
  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Tooltip title="backgroundColor">
            <Label>color：</Label>
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
          <Tooltip title="backgroundImage">
            <Label>image：</Label>
          </Tooltip>
        </Col>

        <Col sm={18}>
          <Tooltip title="backgroundImage">
            <Input
              size="small"
              value={backgroundImage?.replace(/url\(|\)/g, '')}
              placeholder="image url"
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
              <Tooltip title="backgroundSize">
                <Label>size：</Label>
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
                <Option value="default">default</Option>
                <Option value="contain">contain</Option>
                <Option value="cover">cover</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title="backgroundRepeat">
                <Label>repeat：</Label>
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
                <Option value="repeat">repeat</Option>
                <Option value="repeat-x">repeat-x</Option>
                <Option value="repeat-y">repeat-y</Option>
                <Option value="no-repeat">no-repeat</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Tooltip title="backgroundPosition">
                <Label>position：</Label>
              </Tooltip>
            </Col>

            <Col sm={9}>
              <Tooltip title="backgroundPositionX">
                <Input
                  value={backgroundPositionX}
                  placeholder="x"
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
              <Tooltip title="backgroundPositionY">
                <Input
                  style={{ marginLeft: '3%' }}
                  value={backgroundPositionY}
                  placeholder="y"
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
