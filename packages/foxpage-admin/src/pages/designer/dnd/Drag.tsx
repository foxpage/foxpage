import React from 'react';

import { Component } from '@/types/index';

import { useDndContext } from '../context';

import { DRAG_DATA } from './constant';
import { initDragInfo } from './utils';

interface IProps {
  component: Component;
  children: React.ReactNode;
}
const DragContent: React.FC<IProps> = (props) => {
  const { children, component } = props;
  const { handleDragStart, handleDragEnd } = useDndContext();

  const startDrag = (ev: React.DragEvent<HTMLDivElement>) => {
    const data = initDragInfo('add', component);
    ev?.dataTransfer?.setData(DRAG_DATA, JSON.stringify(data));
    if (typeof handleDragStart === 'function') {
      handleDragStart(ev);
    }
  };

  const dragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (typeof handleDragEnd === 'function') {
      handleDragEnd(e);
    }
  };

  return (
    <div draggable="true" onDragStart={startDrag} onDragEnd={dragEnd}>
      <>{children}</>
    </div>
  );
};

export default DragContent;
