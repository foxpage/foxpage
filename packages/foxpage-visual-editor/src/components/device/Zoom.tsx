import React, { useState } from 'react';

import { CaretDownOutlined, CheckOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Popover } from 'antd';

import { Area, Row } from '..';

import './index.css';

interface IProps {
  onChange: (zoom: number) => void;
}

const Zoom = (props: IProps) => {
  const [zoom, setZoom] = useState(1);
  const { onChange } = props;

  const handleChange = (value: number) => {
    setZoom(value);
    onChange(value);
  };

  return (
    <Popover
      placement="bottom"
      overlayClassName="foxpage-visual-editor_popover"
      trigger={['hover']}
      content={
        <div style={{ width: '110px' }}>
          <Area>
            <Row
              onClick={() => {
                handleChange(Number(Math.min(zoom + 0.1, 2).toFixed(1)));
              }}>
              <span>+10%</span>
              <ZoomInOutlined style={{ float: 'right', marginTop: 9 }} />
            </Row>
            <Row
              disable={Number(zoom) < 0.3}
              onClick={() => {
                handleChange(Number(Math.max(zoom - 0.1, 0.2).toFixed(1)));
              }}>
              <span>-10%</span>
              <ZoomOutOutlined style={{ float: 'right', marginTop: 9 }} />
            </Row>
          </Area>
          <Area>
            <Row
              onClick={() => {
                handleChange(0.5);
              }}>
              {zoom === 0.5 && (
                <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />
              )}
              <span>50%</span>
            </Row>
            <Row
              onClick={() => {
                handleChange(1);
              }}>
              {zoom === 1 && (
                <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />
              )}
              <span>100%</span>
            </Row>
            <Row
              onClick={() => {
                handleChange(2);
              }}>
              {zoom === 2 && (
                <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />
              )}
              <span>200%</span>
            </Row>
          </Area>
        </div>
      }>
      <div style={{ width: 50, textAlign: 'center' }}>
        {(Number(zoom) * 100).toFixed()}%
        <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
      </div>
    </Popover>
  );
};

export default Zoom;
