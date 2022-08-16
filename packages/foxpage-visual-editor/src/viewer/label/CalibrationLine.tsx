import React from 'react';

import { DropInfo } from '@/types/index';

interface IProps {
  dndParams?: DropInfo;
  visible?: boolean;
  zoom?: number;
}

const CalibrationLine = (props: IProps) => {
  const { visible = false, dndParams } = props;

  if (!dndParams) {
    return null;
  }

  const { componentNode, parentNode, pos = 'before' } = dndParams;

  let rect: { top?: number; left?: number; width?: number; height?: number } = {};
  if (componentNode) {
    const wrapper = componentNode.getAttribute('data-node-wrapper');
    if (wrapper) {
      rect = parentNode ? parentNode.getBoundingClientRect() : {};
    } else {
      rect = componentNode.getBoundingClientRect();
    }
  }

  const { top = 0, left = 0, width = 0, height = 0 } = rect;
  const marginTop = -4;
  // get top & left value
  let calcTop = top;
  const calcLeft = left;

  const calcWidth = width;
  if (pos === 'after') {
    calcTop += height;
  }

  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        transition: 'top .2s,left .2s,width .2s,height .2s',
        display: visible ? 'block' : 'none',
        top: calcTop,
        left: calcLeft,
        width: calcWidth,
        borderColor: 'transparent #03b403',
        borderWidth: '3px 3px',
        borderStyle: 'solid',
        pointerEvents: 'none',
        marginTop,
      }}>
      <div
        style={{
          background: '#03b403',
          boxShadow: '0 0 3px rgba(0,0,0,0.2)',
          padding: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default CalibrationLine;
