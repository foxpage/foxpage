import React from 'react';

import { useDndContext } from '../../context';

interface IProps {}

const CalibrationLine = (_props: IProps) => {
  const { placeholder: dndParams, inDropZone } = useDndContext();
  if (!inDropZone) {
    return null;
  }

  const defaultWidth = document.getElementById('component-viewer')?.clientWidth;

  const { rect, placement = 'before' } = dndParams || {};

  const { top = 0, left = 0, width = defaultWidth, height = 3 } = rect || {};
  const marginTop = -4;
  // get top & left value
  let calcTop = top;
  const calcLeft = left;

  const calcWidth = width;
  if (placement === 'after') {
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
