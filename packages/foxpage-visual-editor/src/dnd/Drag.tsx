import React from 'react';

import { Component } from '@/types/index';

import { DRAG_DATA } from './constant';
import { initDragInfo } from './utils';

interface IProps {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  showPlaceholder?: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
  component: Component;
}
const DragContent: React.FC<IProps> = (props) => {
  const { children, component, showPlaceholder, onDragStart, onDragEnd } = props;

  const startDrag = (ev: any) => {
    const data = initDragInfo('add', component);
    ev?.dataTransfer?.setData(DRAG_DATA, JSON.stringify(data));
    if (typeof onDragStart === 'function') {
      onDragStart();
    }
  };

  const dragEnd = () => {
    if (typeof showPlaceholder === 'function') {
      showPlaceholder(false, {}, { scrollX: 0, scrollY: 0 });
    }
    if (typeof onDragEnd === 'function') {
      onDragEnd();
    }
  };

  return (
    <div draggable="true" onDragStart={startDrag} onDragEnd={dragEnd}>
      {children}
    </div>
  );
};

export default DragContent;
