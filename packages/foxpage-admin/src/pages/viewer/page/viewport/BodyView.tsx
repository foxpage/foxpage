import React, { ReactNode } from 'react';

import { createGlobalStyle, StyleSheetManager } from 'styled-components';

import { IWindow } from '@/types/index';

import DropContext from '../../dnd/DropContext';

import ViewWrapper from './ViewWrapper';

const GlobalStyle = createGlobalStyle<{ gridMode: string }>`
  *[data-node="component"] {
    outline: ${props => (props.gridMode === 'all' ? '1px dashed #cccccc' : 'none')};
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
  loadedComponents: any;
  renderStructure: any;
  win: IWindow;
  onClick: (id: string) => void;
  showPlaceholder: (offSet: boolean, dndParams: any, position: { scrollX: number; scrollY: number }) => void;
  addComponent: (type: 'insert' | 'append', componentId: string, pos: string, desc: any, parentId: string) => void;
  onMouseOverComponentChange: (component?: any) => void;
  onDoubleClick: (component?: any) => void;
}
const BodyView: React.FC<BodyViewProps> = props => {
  const {
    renderStructure,
    loadedComponents = {},
    win = window as unknown as IWindow,
    onClick,
    showPlaceholder,
    addComponent,
    onMouseOverComponentChange,
    onDoubleClick,
  } = props;

  const renderComponents = (tree: any): ReactNode[] => {
    const nodes: Array<ReactNode> = [];
    for (let i = 0; i < tree.length; i++) {
      const { id, props, children = [] } = tree[i];

      const childrenNodes: Array<ReactNode> = children && children.length > 0 ? renderComponents(children) : [];
      nodes.push(
        <ViewWrapper
          key={id}
          win={win}
          props={props}
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
    <StyleSheetManager target={win.document.head}>
      <React.Fragment>
        <GlobalStyle gridMode="all" />
        <DropContext win={win} showPlaceholder={showPlaceholder} addComponent={addComponent}>
          {Object.keys(loadedComponents).length > 0 ? renderComponents(renderStructure) : null}
        </DropContext>
      </React.Fragment>
    </StyleSheetManager>
  );
};
export default BodyView;
