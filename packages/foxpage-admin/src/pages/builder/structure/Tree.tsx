import React from 'react';

import styled from 'styled-components';

import { ComponentSourceMapType, ComponentStructure } from '@/types/builder';

import ComponentNode from './Node';

const Root = styled.div`
  height: 100%;
  width: 100%;
  padding: 10px;
  font-size: 12px;
  position: relative;
  overflow: auto;
  ::-webkit-scrollbar {
    width: 1px;
  }
`;

const Layer = styled.div`
  user-select: none;
  position: relative;
`;

const ComponentList = styled(Layer)`
  position: relative;
`;

const Child = styled.div`
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

interface Type {
  renderStructure: ComponentStructure[];
  dragedComponentId?: string;
  componentSourceMap: ComponentSourceMapType;
  expendIds: string[];
  selectedComponentId: string;
  onDragStart: (ev, component: ComponentStructure, index: number) => void;
  onDragOver: (e) => void;
  onDragEnd: () => void;
  onDrop: (e) => void;
  onToggleExpend: (e, componentId: string) => void;
  handleSelectComponent: (componentId: string) => void;
}

const TreeMemo: React.FC<Type> = props => {
  const {
    renderStructure,
    dragedComponentId,
    expendIds,
    componentSourceMap,
    selectedComponentId,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    onToggleExpend,
    handleSelectComponent,
  } = props;

  const renderNode = (component: ComponentStructure, idx: number, paddingLeft: number, visible = true) => {
    const { id, children = [] } = component;
    const childNum = children.length;
    const disabled = dragedComponentId === id;
    const expended = !(expendIds.indexOf(id) > -1); // default expend all
    const isSelected = selectedComponentId === id;
    return (
      <Layer key={id} id={visible ? `layer_${id}` : undefined} data-type="layer" data-component-id={id}>
        <ComponentNode
          componentId={id}
          visible={visible}
          component={component}
          idx={idx}
          childNum={childNum}
          expended={expended}
          style={{
            paddingLeft,
            color: isSelected ? 'rgb(41, 141, 248)' : 'inherit',
            background: isSelected ? 'rgb(242, 248, 255)' : 'inherit',
          }}
          componentSourceMap={componentSourceMap}
          handleSelectComponent={handleSelectComponent}
          toggleExpend={e => onToggleExpend(e, id)}
          dragStart={(e, node: ComponentStructure) => onDragStart(e, node, idx)}
          dragEnd={onDragEnd}
        />
        {childNum > 0 && (
          <Child data-type="childrenList">
            {children.map((item, index) => {
              if (expended) {
                const isWrapper =
                  item.children && item.children.length > 0 && item.children[0].wrapper
                    ? item.children[0].wrapper === item.id
                    : false;
                return renderNode(
                  item,
                  item.wrapper ? idx : index,
                  isWrapper ? paddingLeft : paddingLeft + 15,
                  !isWrapper,
                );
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
    <Root id="root" data-type="root" onDragOver={onDragOver} onDrop={onDrop}>
      <ComponentList data-type="childrenList">
        {renderStructure &&
          renderStructure.length > 0 &&
          renderStructure.map((node: ComponentStructure, idx) => {
            const isWrapper = node.children?.length > 0 ? node.children[0]?.wrapper === node.id : false;
            return renderNode(node, idx, 0, !isWrapper);
          })}
      </ComponentList>
    </Root>
  );
};

export default TreeMemo;
