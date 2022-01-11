import React, { ReactNode, useEffect, useState } from 'react';

import { ComponentStructure } from '@/types/builder';
import { IWindow } from '@/types/index';

import BlankNode from './BlankNode';
import WithErrorCath from './WithErrorCatch';

interface ViewWrapper {
  component: ComponentStructure;
  props: any;
  isWrapper: boolean;
  win: IWindow;
  childes?: Array<ReactNode>;
  loadedComponents: any;
  onClick: (id: string) => void;
  onMouseOverComponentChange: (component?: any) => void;
  onDoubleClick: (component?: any) => void;
}
const ViewWrapper: React.FC<ViewWrapper> = props => {
  const {
    component,
    isWrapper,
    loadedComponents = {},
    childes = [],
    onClick,
    onMouseOverComponentChange,
    onDoubleClick,
  } = props;
  const { id, name, meta, enableChildren } = component;
  // const [initialProps, setInitialProps] = useState({});
  const [node, setNode] = useState<ReactNode>();
  const [hovered, setHovered] = useState<boolean>(false);

  const core = loadedComponents[component.name];

  // useEffect(() => {
  // if (core && typeof core.beforeNodeBuild === 'function') {
  //   const req = core.beforeNodeBuild({ props: component.props });
  //   if (!!req && typeof req.then === 'function') {
  //     req.then(
  //       result => {
  //         setInitialProps(result);
  //       },
  //       e => {
  //         message.error('Initial props failed.');
  //         console.log(e);
  //         setInitialProps({});
  //       },
  //     );
  //   } else {
  //     setInitialProps(req || {});
  //   }
  // } else {
  //   setInitialProps({});
  // }
  // }, [core]);

  const handleMouseOver = (e: any) => {
    setHovered(true);
    onMouseOverComponentChange(component);
    e.stopPropagation();
  };

  const handleMouseOut = (e: any) => {
    setHovered(false);
    onMouseOverComponentChange();
    e.stopPropagation();
  };

  const handleDoubleClick = (e: any) => {
    onDoubleClick(component);
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
    onClick: (e: any) => {
      if (isWrapper && component.children && component.children.length > 0) {
        onClick(component.children[0].id);
      } else {
        onClick(component.id);
      }
      e.stopPropagation();
    },
    onMouseOver: !component.wrapper ? handleMouseOver : undefined,
    onMouseOut: !component.wrapper ? handleMouseOut : undefined,
    onDoubleClick: handleDoubleClick,
  };

  useEffect(() => {
    if (core) {
      setNode(
        React.createElement(
          meta?.notRender ? BlankNode : core,
          { ...component.props, ...(isWrapper ? decoratorInfo : {}) },
          childes,
        ),
      );
    }
  }, [component.props, childes, hovered]);

  if (meta?.decorated || isWrapper || meta?.notRender) {
    return (
      <React.Fragment>
        {node && <WithErrorCath componentId={id} componentName={name} componentType={name} componentNode={node} />}
      </React.Fragment>
    );
  }
  return (
    <div {...decoratorInfo}>
      {node && <WithErrorCath componentId={id} componentName={name} componentType={name} componentNode={node} />}
    </div>
  );
};
export default ViewWrapper;
