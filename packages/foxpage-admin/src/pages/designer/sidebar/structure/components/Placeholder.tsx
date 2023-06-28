import React, { useContext } from 'react';

import { STRUCTURE_DROP_IN, STRUCTURE_DROP_IN_ID } from '../../../constant';
import { StructureTreeContext } from '../../../context';

const LEFT = 5;

const Placeholder: React.FC = () => {
  const { dndInfo } = useContext(StructureTreeContext);
  const container = document.getElementById(STRUCTURE_DROP_IN);
  const { top: rootTop, width: containerWidth = 0 } = container?.getBoundingClientRect() || {};
  const { placement, dropInId, noUpdate } = dndInfo || {};
  if (!dndInfo || dndInfo.noUpdate) {
    return null;
  }

  const borderWidth = 3;
  let scrollTop = 0;
  let widthValue = containerWidth - 16; // 16 is padding
  const dropNode = document.getElementById(dropInId || 'unknown');
  if (dropNode) {
    const { height, top, bottom } = dropNode.getBoundingClientRect();
    if (placement === 'before') {
      scrollTop = top - borderWidth * 1.5;
    } else if (placement === 'after' && bottom) {
      scrollTop = bottom - borderWidth * 1.5;
    } else if (placement === 'in') {
      scrollTop = top + height / 2 - borderWidth * 1.5;
    }
  } else if (placement === 'in' && !noUpdate) {
    const result = document.getElementById(`layer_${STRUCTURE_DROP_IN_ID}`)?.getBoundingClientRect();
    scrollTop = result?.bottom || 0;
  }

  const TOP = dropNode ? scrollTop - (rootTop || 0) - 2 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        transition: 'top .2s,left .2s',
        top: `${TOP}px`,
        left: `${LEFT}px`,
        display: !!dndInfo ? 'block' : 'none',
        width: `${widthValue}px`,
        borderColor: 'transparent #03b403',
        borderWidth: borderWidth,
        borderStyle: 'solid',
        pointerEvents: 'none',
        marginTop: 0,
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

export default Placeholder;
