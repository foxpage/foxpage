import React, { ReactNode, useContext, useState } from 'react';

import { FoxContext } from '@/context/index';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import BlankNode from './BlankNode';
import WithHook, { ExtendInfo } from './WithHook';

interface IProps extends Required<Pick<ExtendInfo, 'isWrapper'>> {
  node: RenderStructureNode;
  childList?: Array<ReactNode>;
  decorated?: boolean;
  onClick?: FoxBuilderEvents['onSelectComponent'];
}

const Wrapper = (props: IProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const { componentMap } = useContext(FoxContext);
  const { node, childList = [], decorated = true, onClick, ...rest } = props;
  const { id, name, __editorConfig } = node;
  const { editable = false, styleable = false } = __editorConfig || {};
  const component = componentMap[node.name];
  const { meta, enableChildren } = component || {};

  const handleMouseOver = (e) => {
    if (hovered !== true) {
      setHovered(true);
    }
    e.stopPropagation();
  };

  const handleMouseOut = (e) => {
    if (hovered !== false) {
      setHovered(false);
    }
    e.stopPropagation();
  };

  const handleClick = (e) => {
    if (!editable) {
      return;
    }
    if (typeof onClick === 'function') {
      if (rest.isWrapper && node.children && node.children.length > 0) {
        onClick(node.children[0], { from: 'viewer' });
      } else {
        onClick(node, { from: 'viewer' });
      }
    }
    e.stopPropagation();
  };

  const decoratorInfo = {
    id,
    'data-node-name': name,
    'data-node-belong-template': !editable,
    'data-node': 'component',
    'data-node-wrapper': styleable || undefined,
    'data-node-drag-in': enableChildren,
    className: hovered && editable ? 'hovered' : '',
    onClick: handleClick,
    onMouseOver: !styleable ? handleMouseOver : undefined,
    onMouseOut: !styleable ? handleMouseOut : undefined,
  };

  if (typeof meta === 'object' && meta?.notRender) {
    return <BlankNode>{childList}</BlankNode>;
  }

  const extendData: ExtendInfo = {
    decoratorInfo,
    childList,
    ...rest,
  };

  if (!decorated || (typeof meta === 'object' && (meta?.decorated || rest.isWrapper || meta?.notRender))) {
    return <WithHook component={node} extendData={extendData} />;
  }

  return (
    <div {...decoratorInfo}>
      <WithHook component={node} extendData={extendData} />
    </div>
  );
};
export default Wrapper;
