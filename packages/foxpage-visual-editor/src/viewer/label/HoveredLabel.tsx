import React from 'react';

import styled from 'styled-components';

import { RectInfo, RenderStructureNode } from '@/types/index';

const Box = styled.div`
  position: absolute;
  font-size: 12px;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
`;

interface IProps {
  hoveredComponent?: RenderStructureNode;
}

const HoveredLabel = (props: IProps) => {
  const { hoveredComponent } = props;

  if (!hoveredComponent || !hoveredComponent.__editorConfig?.editable) {
    return null;
  }

  const hoveredEle = window.document.getElementById(hoveredComponent.id);

  let labelStyle: RectInfo = {
    top: 0,
    height: 0,
    left: 0,
    width: 0,
  };
  // selectedWrapperComponent
  if (hoveredEle) {
    const rect = hoveredEle.getBoundingClientRect();
    labelStyle = {
      top: rect.top,
      height: rect.height,
      left: rect.left,
      width: rect.width,
    };
  }

  if (labelStyle.width === 0) {
    return null;
  }

  return <Box style={{ ...labelStyle }}></Box>;
};

export default HoveredLabel;
