import React from 'react';

import { Drop } from '@/types/component';

interface PropType {
  dndParams?: Drop;
  visible: boolean;
  zoom?: number;
}

const CalibrationLine: React.FC<PropType> = (props) => {
  const { visible, dndParams } = props;

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

  // get root element && position info
  const rootEle = window.document.getElementById('foxpage-visual-main');

  const marginTop = -4;
  // get top & left value
  let calcTop = top + (rootEle?.scrollTop || 0);
  const calcLeft = left + (rootEle?.scrollLeft || 0);

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
        borderColor: 'transparent #56e056',
        borderWidth: '3px 3px',
        borderStyle: 'solid',
        pointerEvents: 'none',
        marginTop,
      }}>
      <div
        style={{
          background: '#56e056',
          boxShadow: '0 0 3px rgba(0,0,0,0.2)',
          padding: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default CalibrationLine;
