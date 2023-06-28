import React, { useContext, useEffect, useState } from 'react';

import { STRUCTURE_DROP_IN } from '../../../constant';
import { StructureTreeContext } from '../../../context';

const HoverBoundary = () => {
  const [rect, setRect] = useState<{ top: number; height: number; width: number } | null>(null);
  const { dndInfo } = useContext(StructureTreeContext);
  const { dropInId, placement } = dndInfo || {};
  const rootTop = document.getElementById(STRUCTURE_DROP_IN)?.getBoundingClientRect().top;

  useEffect(() => {
    if (!dropInId || placement !== 'in') {
      setRect(null);
      return;
    }
    const element = document.getElementById(`layer_${dropInId}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      setRect(rect);
    } else {
      setRect(null);
    }
  }, [dropInId, placement]);
  if (rect) {
    const { top = 0, height = 0, width = 0 } = rect;
    return (
      <div
        className="absolute z-[1] pointer-events-none outline-offset-0 outline-2 outline-dashed outline-fox-secondary"
        style={{
          width: width - 8,
          height: height,
          top: top - (rootTop || 0),
          left: 8,
        }}
      />
    );
  }
  return null;
};

export default HoverBoundary;
