import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { DndInfoType } from '@/types/builder/dnd';

const Root = styled.div`
  position: absolute;
  right: 10px;
  z-index: 1;
  outline: 2px dashed #ffa100;
  pointer-events: none;
  outline-offset: 1px;
`;

const mapStateToProps = (store: RootState) => ({
  dndInfo: store.builder.template.dndInfo,
});

interface Type {
  dndInfo?: DndInfoType;
}

const HoverBoundary: React.FC<Type> = props => {
  const [rect, setRect] = useState<{ top: number; height: number; width: number } | null>(null);
  const [rootTop, setRootTop] = useState<number>(0);
  const { dndInfo: { hoverComponentId } = { hoverComponentId: '' } } = props;

  useEffect(() => {
    const root = document.getElementById('structure-container');
    if (root) {
      setRootTop(root.getBoundingClientRect().top);
    }
  }, []);

  useEffect(() => {
    if (!hoverComponentId) {
      setRect(null);
      return;
    }
    const element = document.getElementById(`layer_${hoverComponentId}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      setRect(rect);
    } else {
      setRect(null);
    }
  }, [hoverComponentId]);

  if (rect) {
    const { top = 0, height = 0, width = 0 } = rect;
    return <Root style={{ width, height, top: top - rootTop }} />;
  }
  return null;
};

export default connect(mapStateToProps, null)(HoverBoundary);
