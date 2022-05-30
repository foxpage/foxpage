import React, { ReactNode } from 'react';

import { createGlobalStyle } from 'styled-components';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { ComponentStructure } from '@/types/component';

import ViewWrapper from './ViewWrapper';

const GlobalStyle = createGlobalStyle`
  *[data-node="component"] {
    outline: 1px dashed transparent;
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
  onMouseOverComponentChange: (component?: ComponentStructure) => void;
}

const BodyView: React.FC<BodyViewProps> = (props) => {
  const { loadedComponents = {}, renderStructure, onClick, onMouseOverComponentChange } = props;

  const renderComponents = (tree: ComponentStructure[]): ReactNode[] => {
    const nodes: Array<ReactNode> = [];
    for (let i = 0; i < tree.length; i++) {
      const { id, children = [] } = tree[i];

      const childrenNodes: Array<ReactNode> =
        children && children.length > 0 ? renderComponents(children) : [];
      nodes.push(
        <ViewWrapper
          key={id}
          childes={childrenNodes}
          isWrapper={
            children.length > 0 && children[0] && children[0].wrapper ? children[0].wrapper === id : false
          }
          component={tree[i]}
          loadedComponents={loadedComponents}
          onClick={onClick}
          onMouseOverComponentChange={onMouseOverComponentChange}
        />,
      );
    }
    return nodes;
  };

  return (
    <>
      <GlobalStyle />
      {Object.keys(loadedComponents).length > 0 ? renderComponents(renderStructure) : null}
    </>
  );
};
export default BodyView;
