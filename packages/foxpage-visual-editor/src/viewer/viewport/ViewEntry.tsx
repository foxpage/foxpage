import React, { ReactNode, useCallback, useContext } from 'react';

import { createGlobalStyle, StyleSheetManager } from 'styled-components';

import { EditorContext } from '@/context/index';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';
import { getFrameDoc } from '@/utils/index';

import Wrapper from './Wrapper';

const GlobalStyle = createGlobalStyle`
  *[data-node="component"] {
    outline: ${(props: { gridMode: string }) => (props.gridMode === 'all' ? '1px dashed #cccccc' : 'none')};
    outline-offset: -2px;
    position: relative;
    &.hovered {
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
  *[data-node-drag-in="true"]>div:empty {
    min-height: 48px !important;
    background: rgba(255, 255, 255, 0.3);
    outline-offset: -1px;
    position: relative;
    ${(props: { gridMode: string }) =>
      props.gridMode === 'none' ? 'none' : 'outline: 1px dashed rgba(0, 0, 0, 0.3);'}
  }
  *[data-node-drag-in="true"]>div:empty:before {
    content: '+';
    font-size: 14px;
    line-height: 1;
    color: rgba(0, 0, 0, 0.5);
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -5px;
    margin-top: -7px;
  }
  *[data-node-type="system.root-container"]>div:empty {
    outline: none;
  }
  *[data-node-type="system.root-container"]>div:empty:before {
    content: '';
  }
`;

export interface IProps {
  renderStructure: RenderStructureNode[];
  decorated?: boolean;
  onSelectNode?: FoxBuilderEvents['onSelectComponent'];
}

const ViewEntry = (props: IProps) => {
  const { renderStructure, decorated, onSelectNode } = props;

  const render = useCallback(() => {
    const renderComponents = (tree: RenderStructureNode[]): ReactNode[] => {
      const nodes: Array<ReactNode> = [];
      for (let i = 0; i < tree.length; i++) {
        const { id, children = [], __editorConfig } = tree[i];
        const { visible = true } = __editorConfig || {};

        if (visible) {
          const childrenNodes: ReactNode[] = children.length > 0 ? renderComponents(children) : [];
          const firstChild = children.length > 0 && children[0] ? children[0] : null;
          const isWrapper =
            (firstChild?.__editorConfig?.styleable && firstChild.__styleNode?.id === id) || false;
          nodes.push(
            <Wrapper
              key={id}
              childList={childrenNodes}
              isWrapper={isWrapper}
              decorated={decorated}
              node={tree[i]}
              onClick={onSelectNode}
            />,
          );
        }
      }
      return nodes;
    };
    return renderComponents(renderStructure);
  }, [renderStructure]);

  return (
    <>
      {
        // @ts-ignore
        <StyleSheetManager target={getFrameDoc().head}>
          <>
            {
              //@ts-ignore
              <GlobalStyle gridMode="all" />
            }
            {render()}
          </>
        </StyleSheetManager>
      }
    </>
  );
};
export default ViewEntry;
