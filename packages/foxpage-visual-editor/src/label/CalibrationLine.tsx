import React from 'react';

import { Drop, OffsetType } from '../interface';

interface PropType {
  dndParams?: Drop;
  offSet: OffsetType;
  visible: boolean;
}

const CalibrationLine: React.FC<PropType> = props => {
  const {
    visible,
    dndParams,
    offSet: { scrollY, scrollX },
  } = props;
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

  const marginTop = -16;
  let calcTop = top + scrollY;
  const calcLeft = left + scrollX - 12;
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
        top: calcTop,
        left: calcLeft,
        display: visible ? 'block' : 'none',
        width: calcWidth,
        borderColor: 'transparent #56e056',
        borderWidth: '3px 3px',
        borderStyle: 'solid',
        pointerEvents: 'none',
        marginTop,
      }}
    >
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
