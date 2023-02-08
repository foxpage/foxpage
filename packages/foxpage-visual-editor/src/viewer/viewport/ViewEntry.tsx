import React, { ReactNode, useCallback } from 'react';

import { createGlobalStyle, StyleSheetManager } from 'styled-components';

import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';
import { getFrameDoc } from '@/utils/index';

import Wrapper from './Wrapper';

const GlobalStyle = createGlobalStyle`
  *[data-node="component"] {
    outline: ${(props: { gridMode: string }) => (props.gridMode === 'all' ? '1px dashed #cccccc' : 'none')};
    outline-offset: -2px;
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
  *[data-node-belong-template="true"] {
    outline: none;
  }
  *[data-node-drag-in="true"]:empty {
    height: 48px !important;
    background: rgba(255, 255, 255, 0.3);
    outline-offset: -1px;
    position: relative;
    ${(props: { gridMode: string }) =>
      props.gridMode === 'none' ? 'none' : 'outline: 1px dashed rgba(0, 0, 0, 0.3);'}
  }
  *[data-node-drag-in="true"].empty:before {
    display: flex;
    content: '+';
    font-size: 14px;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.5);
    align-items: center;
    justify-content: center;
    padding: 12px 16px
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
              $composeData={{
                childList: childrenNodes,
                isWrapper,
                decorated,
                node: tree[i],
                onClick: onSelectNode,
              }}
              {...tree[i].props}
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
