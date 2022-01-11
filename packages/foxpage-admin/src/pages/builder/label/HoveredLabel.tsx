import React from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { RectType } from '@/types/builder';
import { IWindow } from '@/types/index';

const Box = styled.div`
  position: absolute;
  font-size: 12px;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
`;

const mapStateToProps = (store: RootState) => ({
  hoveredComponent: store.builder.template.hoveredComponent,
});

interface Props {
  win: IWindow;
}

type HoveredLabelProps = ReturnType<typeof mapStateToProps> & Props;

const HoveredLabel: React.FC<HoveredLabelProps> = props => {
  const { hoveredComponent, win } = props;

  if (!hoveredComponent || !hoveredComponent.belongTemplate) {
    return null;
  }

  const hoveredEle = win.document.getElementById(hoveredComponent.id);
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
          {hoveredComponent.belongTemplate && <React.Fragment>Double Click To Edit Template</React.Fragment>}
        </Box>
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {})(HoveredLabel);
