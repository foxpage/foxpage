import React, { useContext, useEffect, useState } from 'react';

import { Empty } from 'antd';
import styled from 'styled-components';

import { Scrollbar } from '@/components/index';
import { STRUCTURE_DROP_IN } from '@/constant/index';
import { EditorContext, FoxContext } from '@/context/index';
import { DRAG_DATA, initDragInfo } from '@/dnd/index';
import { DndData, RenderStructureNode } from '@/types/index';

import { Placeholder, Tree } from './components/index';
import { getAttrData, getComponentNode } from './utils/utils';
import { Toolbar, Tools } from './tools';

const Container = styled(Scrollbar)`
  height: 100%;
  position: relative;
`;

const DISTANCE = 10;

let _dndInfo: DndData = {
  placement: 'in',
};

const Structure = () => {
  const { structure, events, structureList = [] } = useContext(FoxContext);
  const { selectComponent } = useContext(EditorContext).events;
  const [dragId, setDragId] = useState<string>('');
  const [dndInfo, setDndInfo] = useState<DndData | null>();
  const [expendIds, setExpendIds] = useState<string[]>([]);
  const { onDropComponent } = events;

  useEffect(() => {
    handleDragEnd();
  }, []);

  const handleDragStart = (ev: DragEvent, node: RenderStructureNode) => {
    if (node.id !== dragId) {
      const dragInfo = initDragInfo('move', node);
      ev?.dataTransfer?.setData(DRAG_DATA, JSON.stringify(dragInfo));

      setTimeout(() => {
        setDragId(node.id);
      }, 10);
    }
  };

  const handleDragOver = (e: MouseEvent) => {
    const { target, clientY } = e;
    // init new dndInfo
    const newDnd: DndData = {
      placement: 'in',
    };

    const nodeType = getAttrData(target, 'data-type');
    if (nodeType === STRUCTURE_DROP_IN) {
      newDnd.dropInId = undefined;
    } else if (nodeType === 'mask') {
      newDnd.noUpdate = true;
    } else {
      // over general component
      const overNode = getComponentNode(target);
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
      _dndInfo.noUpdate !== newDnd.noUpdate
    ) {
      _dndInfo.placement = newDnd.placement;
      _dndInfo.noUpdate = newDnd.noUpdate;
      _dndInfo.dropInId = newDnd.dropInId;
      setDndInfo(Object.assign({}, _dndInfo));
    }

    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDndInfo(null);
    setDragId('');
    _dndInfo = {
      placement: 'in',
    };
  };

  const handleOnDrop = (e: any) => {
    e.preventDefault();
    const dragInfo: DndData['dragInfo'] = JSON.parse(e.dataTransfer.getData(DRAG_DATA));
    _dndInfo.dragInfo = dragInfo;
    if (_dndInfo.dropInId) {
      const node = structureList.find((item) => item.id === _dndInfo.dropInId);
      _dndInfo.dropIn = node;
    }
    if (typeof onDropComponent === 'function') {
      onDropComponent(_dndInfo);
    }
    handleDragEnd();
  };

  const handleLevel = () => {
    handleDragEnd();
  };

  if (!structure || structure.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Container id="structure-root" data-type="structure-root">
      <Tree
        dragId={dragId}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleOnDrop}
        onDragEnd={handleDragEnd}
        onDragLevel={handleLevel}
        onExpend={setExpendIds}
        onSelect={selectComponent}
      />
      <Placeholder dndInfo={dndInfo} />
      <Tools dndInfo={dndInfo} />
      <Toolbar expendIds={expendIds} />
    </Container>
  );
};

export default Structure;
