import React, { useContext } from 'react';

import styled from 'styled-components';

import { ComponentStructure, RectType } from '../interface';
import viewerContext from '../viewerContext';

const Box = styled.div`
  position: absolute;
  font-size: 12px;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
`;

interface HoveredLabelProps {
  hoveredComponent?: ComponentStructure;
}

const HoveredLabel: React.FC<HoveredLabelProps> = props => {
  const { hoveredComponent } = props;
  const { foxpageI18n } = useContext(viewerContext);

  if (!hoveredComponent || !hoveredComponent.belongTemplate) {
    return null;
  }

  const hoveredEle = window.document.getElementById(hoveredComponent.id);
  // const root = win.document.querySelector('.frame-content');

  let labelStyle: RectType = {
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

  return (
    <React.Fragment>
      {labelStyle && labelStyle.width > 0 && (
        <Box style={{ ...labelStyle }}>
          {hoveredComponent.belongTemplate && <React.Fragment>{foxpageI18n.jumpTemplateTip}</React.Fragment>}
        </Box>
      )}
    </React.Fragment>
  );
};

export default HoveredLabel;
