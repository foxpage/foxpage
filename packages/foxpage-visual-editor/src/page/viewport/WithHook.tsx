import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';
import { Context, FoxpageStaticComponent, StructureNode } from '@foxpage/foxpage-types';

import { ComponentStructure } from '@/types/component';

import viewerContext from '../../viewerContext';

import WithErrorCatch from './WithErrorCatch';

// TODO: need to clean
export interface ExtendInfo {
  childList?: Array<ReactNode>;
  loadedComponents?: Record<string, FoxpageComponentType>;
  fresh?: boolean;
  isWrapper?: boolean;
  decoratorInfo?: Record<string, any>;
}

interface IProps {
  component: ComponentStructure;
  extendData?: ExtendInfo;
}

const WithHook = (props: IProps) => {
  const [node, setNode] = useState<ReactNode>();
  const [initialProps, setInitialProps] = useState<ComponentStructure['props']>();
  const { locale } = useContext(viewerContext);
  const { component, extendData } = props;
  const { loadedComponents = {}, childList = [], isWrapper, decoratorInfo, fresh } = extendData || {};
  const { id, name, label, type, props: componentProps } = component;
  const core = loadedComponents[component.name];

  useEffect(() => {
    const hook = (core as FoxpageStaticComponent)?.beforeNodeBuild;
    if (typeof hook === 'function') {
      try {
        const ctx = ({
          locale,
        } as unknown) as Context;
        const nodeInfo: StructureNode = {
          id,
          name,
          label: label || name,
          type: type as 'react.component',
          props: Object.assign({}, componentProps),
        };
        const req = hook(ctx, nodeInfo);
        if (!!req && typeof req.then === 'function') {
          req.then(
            (result: ComponentStructure['props']) => {
              setInitialProps(result);
            },
            (e: Error) => {
              // message.error('Initial props failed.');
              console.log('request hook failed:', e);
              setInitialProps({});
            },
          );
        } else {
          setInitialProps(req || {});
        }
      } catch (e) {
        // message.error('Initial props failed.');
        console.log('request hook failed:', e);
      }
    }
  }, [childList, componentProps, fresh]);

  useEffect(() => {
    if (core) {
      setNode(
        React.createElement(
          core,
          { ...component.props, ...(isWrapper ? decoratorInfo : {}), ...(initialProps || {}) },
          childList,
        ),
      );
    }
  }, [component.props, initialProps, childList, fresh]);

  return <WithErrorCatch componentId={id} componentName={name} componentType={type} componentNode={node} />;
};

export default WithHook;
