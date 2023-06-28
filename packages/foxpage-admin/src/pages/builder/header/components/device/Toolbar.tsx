import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import * as ACTIONS from '@/actions/builder/header';

import { cacheData, getCache } from './cache';
import Device from './Device';
import Zoom from './Zoom';

const mapDispatchToProps = {
  update: ACTIONS.updateEditorConfig,
};

function cache(key: string, value: any) {
  const cached = getCache();
  cached[key] = value;
  cacheData(cached);
}

type IProps = typeof mapDispatchToProps;

const Toolbar = (props: IProps) => {
  const { update } = props;
  const [viewWidth, setViewWidth] = useState('100%');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const cached = getCache();
    cached.zoom && setZoom(cached.zoom);
    cached.viewWidth && setViewWidth(cached.viewWidth);
    update({
      zoom: cached.zoom,
      viewWidth: cached.viewWidth,
    });
  }, []);

  const onDeviceChange = (value: number) => {
    setZoom(value);
    update({
      zoom: value,
      viewWidth,
    });
    cache('zoom', value);
  };

  const onZoomChange = (value: string) => {
    setViewWidth(value);
    update({
      zoom,
      viewWidth: value,
    });
    cache('viewWidth', value);
  };

  return (
    <>
      <Device viewWidth={viewWidth} onChange={onZoomChange} />
      <Zoom zoom={zoom} onChange={onDeviceChange} />
    </>
  );
};

export default connect(null, mapDispatchToProps)(Toolbar);
