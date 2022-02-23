import React, { ReactNode } from 'react';

import { createGlobalStyle } from 'styled-components';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import DropContext from '../../drop/DropContext';
import { ComponentAddParams, ComponentStructure, Drop } from '../../interface';

import ViewWrapper from './ViewWrapper';

const GlobalStyle = createGlobalStyle`
  *[data-node="component"] {
    outline: 1px dashed #cccccc;
    outline-offset: -1px;
    transition: outline-color .2s;
    position: relative;
    &.hovered{
      outline-offset: -2px;
      outline: 2px solid #1890ff;
    }
    
    &.has-wrapper{
      outline: none;
      pointer-events: none;
    }
  }
  *[data-node-wrapper]{
    outline: none;
    &:hover{
      outline: none;
    }
  }
`;

interface BodyViewProps {
  loadedComponents: Record<string, FoxpageComponentType>;
  renderStructure: ComponentStructure[];
  onClick: (id: string) => void;
  showPlaceholder: (offSet: boolean, dndParams: Drop, position: { scrollX: number; scrollY: number }) => void;
  addComponent: (params: ComponentAddParams) => void;
  onMouseOverComponentChange: (component?: ComponentStructure) => void;
  onDoubleClick: (component?: ComponentStructure) => void;
}
const BodyView: React.FC<BodyViewProps> = props => {
  const {
    renderStructure,
    loadedComponents = {},
    onClick,
    showPlaceholder,
    addComponent,
    onMouseOverComponentChange,
    onDoubleClick,
  } = props;

  const renderComponents = (tree: ComponentStructure[]): ReactNode[] => {
    const nodes: Array<ReactNode> = [];
    for (let i = 0; i < tree.length; i++) {
      const { id, children = [] } = tree[i];

      const childrenNodes: Array<ReactNode> = children && children.length > 0 ? renderComponents(children) : [];
      nodes.push(
        <ViewWrapper
          key={id}
          childes={childrenNodes}
          isWrapper={children.length > 0 && children[0] && children[0].wrapper ? children[0].wrapper === id : false}
          component={tree[i]}
          loadedComponents={loadedComponents}
          onClick={onClick}
          onMouseOverComponentChange={onMouseOverComponentChange}
          onDoubleClick={onDoubleClick}
        />,
      );
    }
    return nodes;
  };

  return (
    <DropContext showPlaceholder={showPlaceholder} addComponent={addComponent}>
      <GlobalStyle />
      {Object.keys(loadedComponents).length > 0 ? renderComponents(renderStructure) : null}
    </DropContext>
  );
};
export default BodyView;
