import React, { useState } from 'react';

import { handleDragOver as handleDragOverFrame, handleDropComponent } from '@foxpage/foxpage-iframe-actions';

import { DragData } from '@/types/index';

import { DndContext } from './context';

interface DragContextProviderProps {
  children: React.ReactNode;
}

export default function DragContextProvider({ children }: DragContextProviderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inDropZone, setInDropZone] = useState(false);
  const [placeholder, setPlaceholder] = useState<DragData>();

  return (
    <DndContext.Provider
      value={{
        isDragging,
        inDropZone,
        placeholder,
        handleDragStart,
        handleDragEnd,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handlePlaceholder,
        setIsDragging,
      }}>
      {children}
    </DndContext.Provider>
  );

  function handleDragStart(_e) {
    setIsDragging(true);
  }

  function handleDragEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setInDropZone(false);
    setPlaceholder(undefined);
  }

  function handleDragOver(position) {
    handleDragOverFrame(position);
  }

  function handleDrop(data, position) {
    handleDropComponent(data, position);
    setIsDragging(false);
    setInDropZone(false);
    setPlaceholder(undefined);
  }

  function handleDragLeave() {
    setInDropZone(false);
    setPlaceholder(undefined);
  }

  function handleDragEnter() {
    setInDropZone(true);
  }

  function handlePlaceholder(placeholder) {
    setPlaceholder(placeholder);
  }
}
