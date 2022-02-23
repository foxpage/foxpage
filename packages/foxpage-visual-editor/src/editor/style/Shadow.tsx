import React, { useContext, useEffect, useState } from 'react';

import { InputNumber, Radio, Tooltip } from 'antd';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import { ColorPicker } from '@foxpage/foxpage-component-editor-widgets';

import viewerContext from '../../viewerContext';

import { Col, colorPickerStyle, Label, RadioButton, Row } from './Common';
import { ShadowType } from './index.d';

const Shadow: React.FC<ShadowType> = props => {
  const {
    boxShadow,
    onChange = (_key: string, _val: string) => {},
    onApplyState = (_key: string, _val: string) => {},
  } = props;
  const [type, setType] = useState<string>('');
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [color, setColor] = useState<string>('');
  const { foxpageI18n } = useContext(viewerContext);

  useEffect(() => {
    if (boxShadow) {
      const shadowParams = boxShadow.split(' ');
      if (shadowParams[0] === 'inset') {
        setType('inset');
        shadowParams.shift();
      } else {
        setType('');
      }
      setOffsetX(Number(shadowParams[0].replace('px', '')));
      shadowParams.shift();
      setOffsetY(Number(shadowParams[0].replace('px', '')));
      shadowParams.shift();
      setColor(shadowParams[shadowParams.length - 1]);
      shadowParams.pop();
      if (shadowParams.length > 0) {
        setBlur(Number(shadowParams[0].replace('px', '')));
        shadowParams.shift();
      }
      if (shadowParams.length > 0) {
        setSpeed(Number(shadowParams[0].replace('px', '')));
      }
    } else {
      setType('');
      setOffsetX(0);
      setOffsetY(0);
      setBlur(0);
      setSpeed(0);
      setColor('');
    }
  }, [boxShadow]);

  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          <Label>{foxpageI18n.shadowType}：</Label>
        </Col>
        <Col sm={18}>
          <Radio.Group
            style={{ width: '100%' }}
            value={type}
            size="small"
            onChange={(e: any) => {
              onChange(
                'boxShadow',
                `${e.target.value === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${speed}px ${color}`,
              );
              onApplyState(
                'boxShadow',
                `${e.target.value === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${speed}px ${color}`,
              );
            }}
          >
            <RadioButton value="" style={{ width: '50%' }}>
              <span>{foxpageI18n.shadowTypeOutset}</span>
            </RadioButton>

            <RadioButton value="inset" style={{ width: '50%' }}>
              <span>{foxpageI18n.shadowTypeInset}</span>
            </RadioButton>
          </Radio.Group>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Label>{foxpageI18n.color}：</Label>
        </Col>
        <Col sm={18}>
          <EditContext.Provider
            value={{
              componentProps: { color },
              propChange: (_prop: string, val: string) => {
                onChange(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${speed}px ${val}`,
                );
              },
              applyState: () => {
                onApplyState(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${speed}px ${color}`,
                );
              },
              propsChange: () => {},
            }}
          >
            <ColorPicker propKey="color" hideVariableBtn={true} style={colorPickerStyle} />
          </EditContext.Provider>
        </Col>
      </Row>

      <Row>
        <Col sm={9} offset="6">
          <Tooltip title={foxpageI18n.shadowX}>
            <InputNumber
              value={offsetX}
              size="small"
              onChange={(value: number) => {
                onChange(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${value}px ${offsetY}px ${blur}px ${speed}px ${color}`,
                );
              }}
              onBlur={(e: any) => {
                onApplyState(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${e.target.value}px ${offsetY}px ${blur}px ${speed}px ${color}`,
                );
              }}
            />
          </Tooltip>
        </Col>
        <Col sm={9}>
          <Tooltip title={foxpageI18n.shadowY}>
            <InputNumber
              size="small"
              value={offsetY}
              style={{ width: 'auto' }}
              onChange={(value: number) => {
                onChange(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${value}px ${blur}px ${speed}px ${color}`,
                );
              }}
              onBlur={(e: any) => {
                onApplyState(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${e.target.value}px ${blur}px ${speed}px ${color}`,
                );
              }}
            />
          </Tooltip>
        </Col>
      </Row>
      <Row>
        <Col sm={9} offset="6">
          <Tooltip title={foxpageI18n.shadowBlur}>
            <InputNumber
              value={blur}
              size="small"
              onChange={(value: number) => {
                onChange(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${value}px ${speed}px ${color}`,
                );
              }}
              onBlur={(e: any) => {
                onApplyState(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${
                    e.target.value
                  }px ${speed}px ${color}`,
                );
              }}
            />
          </Tooltip>
        </Col>
        <Col sm={9}>
          <Tooltip title={foxpageI18n.shadowSpeed}>
            <InputNumber
              value={speed}
              size="small"
              style={{ width: 'auto' }}
              onChange={(value: number) => {
                onChange(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${value}px ${color}`,
                );
              }}
              onBlur={(e: any) => {
                onApplyState(
                  'boxShadow',
                  `${type === 'inset' ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${e.target.value}px ${color}`,
                );
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Shadow;
