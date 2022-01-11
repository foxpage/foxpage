import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import { DndInfoType } from '@/types/builder';

import { SYSTEM_PAGE } from '../constant';

const LEFT_PADDING = 10;
const LEFT = 10;

const mapStateToProps = (store: RootState) => ({
  dragInfo: store.builder.template.dndInfo,
});

interface PlaceHolderType {
  dragInfo?: DndInfoType;
}

const Placeholder: React.FC<PlaceHolderType> = props => {
  const { dragInfo } = props;
  const [rootTop, setRootTop] = useState<number>(0);
  const borderWidth = 3;

  useEffect(() => {
    const root = document.getElementById('structure-container');
    if (root) {
      setRootTop(root.getBoundingClientRect().top);
    }
  }, []);

  const visible = !_.isEmpty(dragInfo);
  if (!visible) {
    return <div />;
  }
  if (!dragInfo || !dragInfo.componentId || dragInfo.componentId === SYSTEM_PAGE) {
    return null;
  }

  const { height, width, top, bottom } = dragInfo.rect;

  const { method } = dragInfo;
  let scrollTop = 0;
  let widthValue = width;
  let left = LEFT;
  if (method === 'APPEND_BEFORE') {
    scrollTop = top - borderWidth * 1.5;
  } else if (method === 'APPEND_AFTER') {
    scrollTop = bottom - borderWidth * 1.5;
  } else if (method === 'INSERT') {
    scrollTop = top + height / 2 - borderWidth * 1.5;
    widthValue = width - LEFT_PADDING;
    left = LEFT + LEFT_PADDING / 2;
  }

  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        transition: 'top .2s,left .2s,width .2s,height .2s',
        top: `${scrollTop - rootTop}px`,
        left: `${left}px`,
        display: visible ? 'block' : 'none',
        width: `${widthValue}px`,
        borderColor: 'transparent #56e056',
        borderWidth: borderWidth,
        borderStyle: 'solid',
        pointerEvents: 'none',
        marginTop: 0,
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

export default connect(mapStateToProps, null)(Placeholder);
