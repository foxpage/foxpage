import React from 'react';

interface PropType {
  dndParams: any;
  offSet: { scrollX: number; scrollY: number };
  visible: boolean;
}

const CalibrationLine: React.FC<PropType> = props => {
  const {
    visible,
    dndParams,
    offSet: { scrollX, scrollY },
  } = props;
  const {
    componentNode,
    parentNode, // todo: for getComputedStyle
    pos = 'before',
  } = dndParams;

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
  let calcTop = top + scrollY;
  const calcLeft = left + scrollX;
  const calcWidth = width;
  if (pos === 'after') {
    calcTop += height;
  }

  // if (method === 'append') {
  //   marginTop = 4;
  //   calcLeft += 4;
  //   calcWidth -= 8;
  //   if (componentNode) {
  //     if (componentNode.lastChild) {
  //       const lastRect = componentNode.lastChild.getBoundingClientRect();
  //       const { top, height } = lastRect;
  //       calcTop = top + scrollY + height;
  //     }
  //   }
  // }

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
