import React, { ReactNode, useState } from 'react';

import { ComponentStructure } from '@/types/component';

import BlankNode from './BlankNode';
import WithHook, { ExtendInfo } from './WithHook';

interface ViewWrapper extends Required<Pick<ExtendInfo, 'loadedComponents' | 'isWrapper'>> {
  component: ComponentStructure;
  childes?: Array<ReactNode>;
  onClick: (id: string) => void;
  onMouseOverComponentChange: (component?: ComponentStructure) => void;
}

const ViewWrapper: React.FC<ViewWrapper> = (props) => {
  const { component, childes = [], onClick, onMouseOverComponentChange, ...rest } = props;
  const { id, name, meta, enableChildren } = component;

  const [hovered, setHovered] = useState<boolean>(false);

  const handleMouseOver = (e) => {
    setHovered(true);
    e.stopPropagation();
  };

  const handleMouseOut = (e) => {
    setHovered(false);
    e.stopPropagation();
  };

  const handleClick = (e) => {
    if (rest.isWrapper && component.children && component.children.length > 0) {
      onClick(component.children[0].id);
    } else {
      onClick(component.id);
    }
    e.stopPropagation();
  };

  const decoratorInfo = {
    id,
    'data-node-name': name,
    'data-node-belong-template': component.belongTemplate,
    'data-node': 'component',
    'data-node-wrapper': component.wrapper,
    'data-node-drag-in': enableChildren,
    className: hovered ? 'hovered' : '',
    onClick: handleClick,
    onMouseOver: !component.wrapper ? handleMouseOver : undefined,
    onMouseOut: !component.wrapper ? handleMouseOut : undefined,
  };

  if (typeof meta === 'object' && meta?.notRender) {
    return <BlankNode>{childes}</BlankNode>;
  }

  const extendData: ExtendInfo = {
    // fresh: hovered,
    decoratorInfo,
    childList: childes,
    ...rest,
  };

  if (typeof meta === 'object' && (meta?.decorated || rest.isWrapper || meta?.notRender)) {
    return <WithHook component={component} extendData={extendData} />;
  }
  return (
    <div {...decoratorInfo}>
      <WithHook component={component} extendData={extendData} />
    </div>
  );
};
export default ViewWrapper;
