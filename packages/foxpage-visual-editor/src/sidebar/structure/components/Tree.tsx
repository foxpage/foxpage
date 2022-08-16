import React, { useContext, useState } from 'react';

import styled from 'styled-components';

import { STRUCTURE_DROP_IN, STRUCTURE_DROP_IN_ID } from '@/constant/index';
import { FoxContext } from '@/context/index';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';
import { findStructureById, treeToList } from '@/utils/finders';

import Node from './Node';

const Container = styled.div`
  font-size: 12px;
  position: relative;
  padding: 16px 8px 16px 8px;
  height: 100%;
`;

const Layer = styled.div`
  user-select: none;
  position: relative;
`;

const Child = styled(Layer)`
  position: relative;
`;

const Mask = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #e8e8e8;
  opacity: 0.3;
  top: 0;
`;

interface IProps {
  dragId?: string;
  onDragStart: (ev, component: RenderStructureNode) => void;
  onDragLevel: () => void;
  onDragOver: (e) => void;
  onDragEnd: () => void;
  onDrop: (e) => void;
  onExpend: (ids: string[]) => void;
  onSelect?: FoxBuilderEvents['onSelectComponent'];
}

const Tree = (props: IProps) => {
  const [expendIds, setExpendIds] = useState<string[]>([]);
  const { structure, rootNode } = useContext(FoxContext);
  const { dragId, onDragStart, onDragOver, onDragEnd, onDragLevel, onDrop, onExpend, onSelect } = props;

  const showStructures = rootNode ? [{ ...rootNode, children: structure }] : structure;

  const handleToggleExpend = (e: any, componentId: string) => {
    const list: string[] = expendIds.slice();
    const index = list.indexOf(componentId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(componentId);
    }
    setExpendIds(list);
    const children: RenderStructureNode[] = [];
    list.forEach((item) => {
      const node = findStructureById(structure, item);
      if (node && node.children) {
        treeToList(node.children, children);
      }
    });
    onExpend(children.map((item) => item.id));
    e.stopPropagation();
  };

  const handleSelectComponent = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    component: RenderStructureNode,
  ) => {
    if (typeof onSelect === 'function') {
      onSelect(component, { from: 'sider' });
    }
    e.stopPropagation();
  };

  const renderNode = (
    node: RenderStructureNode,
    idx: number,
    paddingLeft: number,
    visible = true,
    isRoot = false,
  ) => {
    const { id, children = [], __editorConfig } = node;
    const childNum = children.length;
    const disabled = dragId === id;
    const expended = !(expendIds.indexOf(id) > -1); // default expend all
    const isRootNode = rootNode?.id === id;
    const { showInStructure = true } = __editorConfig || {};
    return (
      <Layer key={id} id={`layer_${id}`} data-type="layer" data-component-id={id}>
        {visible && showInStructure && (
          <Node
            idx={idx}
            component={node}
            childNum={childNum}
            expended={expended}
            style={{ paddingLeft }}
            toolBar={!isRootNode}
            toggleExpend={(e) => handleToggleExpend(e, id)}
            dragStart={onDragStart}
            dragEnd={onDragEnd}
            onSelect={handleSelectComponent}
          />
        )}

        {childNum > 0 && (
          <Child data-type="childrenList">
            {children.map((item, index) => {
              if (expended) {
                const isWrapper =
                  item.children && item.children.length > 0 && item.children[0].__styleNode
                    ? item.children[0].__styleNode?.id === item.id
                    : false;
                const _paddingLeft = isRoot || !showInStructure ? paddingLeft : paddingLeft + 15;
                return renderNode(item, item.__styleNode ? idx : index, _paddingLeft, !isWrapper);
              }
              return '';
            })}
          </Child>
        )}
        {disabled && <Mask data-type="mask" />}
      </Layer>
    );
  };

  return (
    <Container id={STRUCTURE_DROP_IN} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLevel}>
      {renderNode(
        ({ children: showStructures, id: STRUCTURE_DROP_IN_ID } as unknown) as RenderStructureNode,
        0,
        0,
        false,
        true,
      )}
    </Container>
  );
};

export default Tree;
