import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Empty } from 'antd';
import throttle from 'lodash/throttle';

import { Scrollbar } from '@/components/index';
import { STRUCTURE_DROP_IN } from '@/constant/index';
import { EditorContext, FoxContext, StructureTreeContext } from '@/context/index';
import { DRAG_DATA, initDragInfo } from '@/dnd/index';
import { DndData, RenderStructureNode } from '@/types/index';

import { Placeholder, Tree } from './components/index';
import { getAttrData, getComponentNode } from './utils/utils';
import { Tools } from './tools';

const DISTANCE = 10;

let _dndInfo: DndData = {
  placement: 'in',
};

let levelMark = new Date().getTime();

function initThrottle(fn: (...args: any) => any) {
  return throttle(fn, 60, { trailing: true });
}

let throttleOver = (..._args: any) => {};

const Structure = () => {
  const { pageStructure: structure, events, structureList = [] } = useContext(FoxContext);
  const { selectComponent, setSelectNodeFrom } = useContext(EditorContext).events;
  const [dragId, setDragId] = useState<string>('');
  const [dndInfo, setDndInfo] = useState<DndData | null>();
  const [isDragging, setIsDragging] = useState(false);
  const [_, setExpandIds] = useState<string[]>([]);
  const [scTop, setScrollTop] = useState<number>(0);
  const dragStartRef = useRef<number>(0);
  const treeRef = useRef<{ maxScrollTop: number }>(null);
  const { onDropComponent } = events;

  useEffect(() => {
    throttleOver = initThrottle(dragOver);
    handleDragEnd();
  }, []);

  const computedScrollTop = useMemo(() => {
    const computed = (dndInfo?.clientY || 0) - dragStartRef.current + scTop;
    return Math.min(treeRef.current?.maxScrollTop || 99999, Math.max(0, computed));
  }, [dndInfo, dragStartRef.current, scTop, treeRef.current]);

  const dragOver = () => {
    setDndInfo(Object.assign({}, _dndInfo));
  };

  const handleDragStart = (ev: React.DragEvent, node: RenderStructureNode) => {
    if (node.id !== dragId) {
      const dragInfo = initDragInfo('move', node);
      ev?.dataTransfer?.setData(DRAG_DATA, JSON.stringify(dragInfo));
      dragStartRef.current = ev.clientY;
      setTimeout(() => {
        setDragId(node.id);
        setIsDragging(true);
      }, 10);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    const { target, clientY } = e;
    // init new dndInfo
    const newDnd: DndData = {
      placement: 'in',
      clientY,
    };
    levelMark = new Date().getTime();
    const nodeType = getAttrData(target, 'data-type');
    if (nodeType === STRUCTURE_DROP_IN) {
      newDnd.dropInId = undefined;
    } else if (nodeType === 'mask') {
      newDnd.noUpdate = true;
    } else {
      // over general component
      const overNode = getComponentNode(target as HTMLElement);
      if (overNode) {
        const { top, height, bottom } = overNode.getBoundingClientRect();
        newDnd.dropInId = getAttrData(overNode, 'data-component-id');
        // could insert child
        const withChildren = getAttrData(overNode, 'data-with-children');
        if (withChildren !== 'true') {
          newDnd.placement = clientY <= top + height / 2 ? 'before' : 'after';
        } else {
          const topDistance = top + DISTANCE;
          const bottomDistance = bottom - DISTANCE;

          // top,middle,bottom
          if (clientY < topDistance) {
            newDnd.placement = 'before';
          } else if (clientY <= bottomDistance) {
            newDnd.placement = 'in';
          } else {
            newDnd.placement = 'after';
          }
        }
      }
    }

    if (
      _dndInfo.placement !== newDnd.placement ||
      _dndInfo.dropInId !== newDnd.dropInId ||
      _dndInfo.noUpdate !== newDnd.noUpdate ||
      _dndInfo.clientY !== newDnd.clientY
    ) {
      _dndInfo.placement = newDnd.placement;
      _dndInfo.noUpdate = newDnd.noUpdate;
      _dndInfo.dropInId = newDnd.dropInId;
      _dndInfo.clientY = newDnd.clientY;
      throttleOver();
    }
    e.preventDefault();
  };

  const handleDragEnd = (restDragId: boolean = true) => {
    setIsDragging(false);
    dragStartRef.current = 0;
    setScrollTop(computedScrollTop);
    if (restDragId) {
      setDragId('');
    }
    setDndInfo(null);
    _dndInfo = {
      placement: 'in',
    };
  };

  const handleOnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragInfo: DndData['dragInfo'] = JSON.parse(e.dataTransfer.getData(DRAG_DATA));
    _dndInfo.dragInfo = dragInfo;
    if (_dndInfo.dropInId) {
      const node = structureList.find((item) => item.id === _dndInfo.dropInId);
      _dndInfo.dropIn = node;
    }
    if (!_dndInfo.noUpdate && typeof onDropComponent === 'function') {
      onDropComponent(_dndInfo);
    }
    setSelectNodeFrom(undefined);
    handleDragEnd();
  };

  const handleLeave = () => {
    const _levelMark = levelMark;
    setTimeout(() => {
      if (_levelMark === levelMark) {
        handleDragEnd(false);
      }
    }, 100);
  };

  if (!structure || structure.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="h-full flex flex-col items-center justify-center"
      />
    );
  }

  return (
    <Scrollbar id="structure-root" data-type="structure-root">
      <StructureTreeContext.Provider
        value={{
          dragId,
          isDragging,
          dndInfo,
          scTop,
          computedScrollTop,
          onScroll: (scroll) => setScrollTop(scroll),
          onDragStart: handleDragStart,
          onDragOver: handleDragOver,
          onDrop: handleOnDrop,
          onDragEnd: handleDragEnd,
          onDragLeave: handleLeave,
          onExpand: setExpandIds,
          onSelect: selectComponent,
        }}>
        <Tree ref={treeRef} />
        <Placeholder />
        <Tools />
      </StructureTreeContext.Provider>
    </Scrollbar>
  );
};

export default Structure;
