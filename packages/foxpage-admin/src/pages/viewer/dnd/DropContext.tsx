import React, { ReactChild, ReactNode } from 'react';

import { IWindow } from '@/types/index';

function getCurrentComponentNode(node: any): HTMLElement | undefined {
  if (node.tagName === 'BODY') {
    return undefined;
  }
  if (node.getAttribute('data-node') === 'component') {
    return node;
  }
  return getCurrentComponentNode(node.parentNode);
}

function getParentComponentNode(node: any): HTMLElement | undefined {
  if (node.tagName === 'BODY') {
    return undefined;
  }
  if (node.parentNode.getAttribute('data-node') === 'component') {
    return node.parentNode;
  }
  return getParentComponentNode(node.parentNode);
}

interface DropContextPropType {
  children: ReactChild | ReactNode | null;
  win: IWindow;
  showPlaceholder: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
  addComponent: (type: 'insert' | 'append', componentId: string, pos: string, desc: any, parentId: string) => void;
}

const dndParams: any = {
  method: 'append',
  pos: -1,
  componentId: undefined,
  componentNode: undefined,
  parentNode: undefined,
};
const dndState: any = {};

const DropContext: React.FC<DropContextPropType> = props => {
  const { children, win = window, showPlaceholder, addComponent } = props;
  const drop = (e: any) => {
    const dslString = e.dataTransfer.getData('data-dsl');
    if (!dslString) {
      return;
    }
    const desc = JSON.parse(e.dataTransfer.getData('data-dsl'));
    const { method, componentId, pos } = dndParams;
    if (addComponent) {
      if (method === 'append') {
        addComponent(method, componentId, pos, desc, 'root-container');
      } else {
        const parentNode = dndState?.parentNode;
        const parentId =
          parentNode && parentNode.getAttribute('data-node-belong-template') !== 'true'
            ? dndState.parentNode.id
            : 'root-container';
        addComponent(method, componentId, pos, desc, parentId);
      }
    }

    showPlaceholder(false, {}, { scrollX, scrollY });
    dndParams.componentId = undefined;
    e.preventDefault();
  };

  const dragEnter = (e: any) => {
    e.preventDefault();
  };

  const dragOver = (e: any) => {
    const { scrollX, scrollY } = win;
    const { target, clientY } = e;
    const componentNode = getCurrentComponentNode(target);
    const parentNode = getParentComponentNode(componentNode);
    dndState.componentNode = componentNode;
    dndState.parentNode = parentNode;
    if (componentNode) {
      const componentId = componentNode.getAttribute('id');

      dndState.index = 0;
      if (componentNode.getAttribute('data-node-drag-in') === 'true' || target.getAttribute('data-node') === 'slot') {
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
        if (delta * 2 < rect.height) {
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
        showPlaceholder(true, dndParams, { scrollX, scrollY });
      }
    }

    e.preventDefault();
  };

  const dragLeave = (e: any) => {
    e.preventDefault();
  };

  const dragExit = (e: any) => {
    showPlaceholder(false, {}, { scrollX, scrollY });
    e.preventDefault();
  };

  return (
    <div
      data-node="component"
      id="root-container"
      data-node-type="system.root-container"
      data-node-drag-in="true"
      style={{ minHeight: '100%', outline: '1px dashed #cccccc', overflowX: 'hidden' }}
      onDragExit={dragExit}
      onDragLeave={dragLeave}
      onDragOver={dragOver}
      onDragEnter={dragEnter}
      onDrop={drop}
    >
      {children}
    </div>
  );
};
export default DropContext;
