import React, { useEffect, useMemo, useRef, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Input, Spin } from 'antd';
import throttle from 'lodash/throttle';

import { DndData, RenderStructureNode } from '@/types/index';

import { Scrollbar } from '../../components';
import { STRUCTURE_DROP_IN } from '../../constant';
import { StructureTreeContext, useEditorContext, useFoxpageContext } from '../../context';
import { DRAG_DATA, initDragInfo } from '../../dnd';

import { getAttrData, getComponentNode } from './utils/utils';
import { Placeholder, Tree } from './components';
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
  const { events, structureList = [], dataLoaded, foxI18n } = useFoxpageContext();
  const {
    events: { handleSelectComponent },
  } = useEditorContext();
  const [dragId, setDragId] = useState<string>('');
  const [dndInfo, setDndInfo] = useState<DndData | null>();
  const [isDragging, setIsDragging] = useState(false);
  const [_, setExpandIds] = useState<string[]>([]);
  const [scTop, setScrollTop] = useState<number>(0);
  const [searchValue, setSearchValue] = useState('');
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
      const node = structureList
        .filter((item) => (item.label || item.name).includes(searchValue.trim()))
        .find((item) => item.id === _dndInfo.dropInId);
      _dndInfo.dropIn = node;
    }
    if (!_dndInfo.noUpdate && typeof onDropComponent === 'function') {
      onDropComponent(_dndInfo);
    }
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

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <>
      <div className="px-3 py-1 flex border-b border-b-solid border-b-gray-100 items-center">
        <SearchOutlined className="text-gray-200" />
        <Input
          size="middle"
          bordered={false}
          placeholder={foxI18n.componentSearch}
          style={{ fontSize: '12px' }}
          onChange={handleSearch}
        />
      </div>
      <Scrollbar id="structure-root" data-type="structure-root">
        <Spin spinning={!dataLoaded}>
          <StructureTreeContext.Provider
            value={{
              dragId,
              isDragging,
              dndInfo,
              scTop,
              computedScrollTop,
              searchValue,
              onScroll: (scroll) => setScrollTop(scroll),
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDrop: handleOnDrop,
              onDragEnd: handleDragEnd,
              onDragLeave: handleLeave,
              onExpand: setExpandIds,
              onSelect: handleSelectComponent,
              onSearch: handleSearch,
            }}>
            <Tree ref={treeRef} />
            <Placeholder />
            <Tools />
          </StructureTreeContext.Provider>
        </Spin>
      </Scrollbar>
    </>
  );
};

export default Structure;
