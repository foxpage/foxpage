import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { CaretDownOutlined , CheckOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import GlobalContext from '@/pages/GlobalContext';

import { IconContainer, IconMsg } from '../Header';

import { Area, Row } from './CommonStyles';

import './zoom.css';

const mapStateToProps = (store: RootState) => ({
  versionType: store.builder.template.versionType,
  zoom: store.builder.template.zoom,
  editStatus: store.builder.template.editStatus,
  lastStepStatus: store.builder.template.lastStepStatus,
  nextStepStatus: store.builder.template.lastStepStatus,
});

const mapDispatchToProps = {
  updateZoom: ACTIONS.updateZoom,
};

type ZoomType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<ZoomType> = props => {
  const { zoom, updateZoom } = props;
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;
  return (
    <Popover
      placement="bottom"
      overlayClassName="foxpage-zoom-popover"
      content={
        <div style={{ width: '140px' }}>
          <Area>
            <Row
              onClick={() => {
                updateZoom(Number(Math.min(zoom + 0.1, 2).toFixed(1)));
              }}
            >
              <span>+10%</span>
              <ZoomInOutlined style={{ float: 'right', marginTop: 9 }} />
            </Row>
            <Row
              disable={Number(zoom) < 0.3}
              onClick={() => {
                updateZoom(Number(Math.max(zoom - 0.1, 0.2).toFixed(1)));
              }}
            >
              <span>-10%</span>
              <ZoomOutOutlined style={{ float: 'right', marginTop: 9 }} />
            </Row>
          </Area>
          <Area>
            <Row
              onClick={() => {
                updateZoom(0.5);
              }}
            >
              {zoom === 0.5 && <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />}
              <span>50%</span>
            </Row>
            <Row
              onClick={() => {
                updateZoom(1);
              }}
            >
              {zoom === 1 && <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />}
              <span>100%</span>
            </Row>
            <Row
              onClick={() => {
                updateZoom(2);
              }}
            >
              {zoom === 2 && <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />}
              <span>200%</span>
            </Row>
          </Area>
          {/* <Row>Self-adaptation</Row> */}
        </div>
      }
      trigger="click"
    >
      <IconContainer>
        <span style={{ lineHeight: '16px', fontSize: 14 }}>
          {(Number(zoom) * 100).toFixed()}%
          <CaretDownOutlined style={{ fontSize: 8 }} />
        </span>
        <IconMsg>{builder.zoom}</IconMsg>
      </IconContainer>
    </Popover>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
