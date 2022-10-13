import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { Context, FoxpageStaticComponent, StructureNode } from '@foxpage/foxpage-types';

import { FoxContext } from '@/context/index';
import { RenderStructureNode } from '@/types/index';

import WithErrorCatch from './WithErrorCatch';

export interface ExtendInfo {
  childList?: Array<ReactNode>;
  fresh?: boolean;
  isWrapper?: boolean;
  decoratorInfo?: Record<string, any>;
}

interface IProps {
  component: RenderStructureNode;
  extendData?: ExtendInfo;
}

const WithHook = (props: IProps) => {
  const [node, setNode] = useState<ReactNode>();
  const [initialProps, setInitialProps] = useState<RenderStructureNode['props']>();
  const { config, loadedComponents } = useContext(FoxContext);
  const { component, extendData } = props;
  const { childList = [], isWrapper, decoratorInfo, fresh } = extendData || {};
  const { id, name, label, type, __renderProps: componentProps } = component;
  const core = loadedComponents[component.name];

  useEffect(() => {
    const hook = (core as FoxpageStaticComponent)?.beforeNodeBuild;
    if (typeof hook === 'function') {
      try {
        const ctx = ({
          locale: config.page?.locale,
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
            (result: RenderStructureNode['props']) => {
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
    } else {
      setInitialProps({});
    }
  }, [childList, componentProps, fresh]);

  useEffect(() => {
    if (core && initialProps) {
      setNode(
        React.createElement(
          core,
          {
            ...component.__renderProps,
            ...(isWrapper ? decoratorInfo : {}),
            ...(initialProps || {}),
          },
          childList,
        ),
      );
    }
  }, [component.__renderProps, initialProps, isWrapper, childList, fresh]);

  return <WithErrorCatch componentId={id} componentName={name} componentType={type} componentNode={node} />;
};

export default WithHook;
