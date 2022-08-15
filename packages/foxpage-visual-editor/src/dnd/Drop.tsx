import React, { ReactChild, ReactNode, useContext, useRef } from 'react';

import { DndData, FoxBuilderEvents } from '@/types/index';

import { FoxContext } from '../context';

import * as Constants from './constant';
import { DRAG_DATA } from './constant';

function getCurrentComponentNode(node): HTMLElement | undefined {
  if (node.tagName === 'BODY') {
    return undefined;
  }
  if (node.getAttribute('data-node') === Constants.DROP_CONTAINER_NODE) {
    return node;
  }
  return getCurrentComponentNode(node.parentNode);
}

function getParentComponentNode(node): HTMLElement | undefined {
  if (node.tagName === 'BODY' || !node) {
    return undefined;
  }
  if (node.parentNode.getAttribute('data-node') === Constants.DROP_CONTAINER_NODE) {
    return node.parentNode;
  }
  return getParentComponentNode(node.parentNode);
}

interface DropContextPropType {
  children: ReactChild | ReactNode | null;
  onPlaceholder: (value: { visible: boolean; dndParams }) => void;
  onDropComponent?: FoxBuilderEvents['onDropComponent'];
}

const dndParams: any = {
  method: 'append',
  pos: -1,
  componentId: undefined,
  componentNode: undefined,
  parentNode: undefined,
};
const dndState: any = {};

const DropContext: React.FC<DropContextPropType> = (props) => {
  const { structureList = [] } = useContext(FoxContext);
  const { children, onPlaceholder, onDropComponent } = props;
  const componentNodeRef = useRef<HTMLElement | undefined>();

  const handlePlaceHolder = (visible: boolean, dndParams) => {
    onPlaceholder({ visible, dndParams });
  };

  const dragEnter = (e) => {
    e.preventDefault();
  };

  const dragOver = (e) => {
    const { target, clientY } = e;
    const componentNode = getCurrentComponentNode(target);
    const parentNode = getParentComponentNode(componentNode);
    dndState.componentNode = componentNode;
    dndState.parentNode = parentNode;

    componentNodeRef.current = componentNode;

    if (componentNode) {
      const componentId = componentNode.getAttribute('id');

      dndState.index = 0;
      if (
        componentNode.getAttribute('data-node-drag-in') === 'true' ||
        target.getAttribute('data-node') === 'slot'
      ) {
        // append into slot
        // const wrapper = componentNode.getAttribute('data-node-wrapper');
        dndState.method = 'append';
        dndState.componentId = componentId || '';
        dndState.pos = -1;
      } else {
        const wrapper = componentNode.getAttribute('data-node-wrapper');
        if (wrapper) {
          dndState.componentId = wrapper;
          dndState.componentNode = parentNode;
          dndState.parentNode = getParentComponentNode(parentNode);
        } else {
          dndState.componentId = componentId;
        }

        const rect = dndState.componentNode.getBoundingClientRect();
        const delta = clientY - rect.top;
        if (delta * 2 <= rect.height) {
          dndState.pos = 'before';
        } else {
          dndState.pos = 'after';
        }
        dndState.method = 'insert';
      }

      if (
        dndState.componentId === '' ||
        dndState.componentId !== dndParams.componentId ||
        dndState.pos !== dndParams.pos
      ) {
        Object.assign(dndParams, dndState);
        // put placeholder on tools layer
        handlePlaceHolder(true, dndParams);
      }
    }

    e.preventDefault();
  };

  const dragLeave = (e) => {
    handlePlaceHolder(false, {});
    e.preventDefault();
  };

  const drop = (e) => {
    const dslString = e.dataTransfer.getData(DRAG_DATA);
    if (!dslString) {
      return;
    }
    const desc = JSON.parse(dslString);
    const { method, componentId, pos } = dndParams;
    const dropNode = structureList.find((item) => item.id === componentId);
    if (typeof onDropComponent === 'function') {
      const dndData: DndData = {
        placement: 'in',
        dragInfo: desc,
        dropIn: dropNode,
      };
      if (method === 'insert') {
        dndData.placement = pos;
      }
      onDropComponent(dndData);
    }

    handlePlaceHolder(false, {});
    dndParams.componentId = undefined;
    e.preventDefault();
  };

  const dragExit = (e) => {
    handlePlaceHolder(false, {});
    e.preventDefault();
  };

  return (
    <div
      id={Constants.DROP_CONTAINER}
      data-node={Constants.DROP_CONTAINER_NODE}
      data-node-type={Constants.DROP_CONTAINER_NODE_TYPE}
      data-node-drag-in={Constants.DROP_CONTAINER_DROP_IN}
      style={{ minHeight: '100%', outline: '1px dashed #cccccc', overflowX: 'hidden' }}
      onDragExit={dragExit}
      onDragLeave={dragLeave}
      onDragOver={dragOver}
      onDragEnter={dragEnter}
      onDrop={drop}>
      {children}
    </div>
  );
};
export default DropContext;
