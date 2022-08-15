import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { STRUCTURE_DROP_IN } from '@/constant/index';
import { DndData } from '@/types/index';

const Root = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;
  outline: 2px dashed #ffa100;
  pointer-events: none;
  outline-offset: 1px;
`;

interface IProps {
  dndInfo?: DndData | null;
}

const HoverBoundary = (props: IProps) => {
  const [rect, setRect] = useState<{ top: number; height: number; width: number } | null>(null);
  const { dropInId, placement } = props.dndInfo || {};
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
    return <Root style={{ width, height, top: top - (rootTop || 0), left: 8 }} />;
  }
  return null;
};

export default HoverBoundary;
