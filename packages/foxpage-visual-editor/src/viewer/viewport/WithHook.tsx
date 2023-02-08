import React, { ReactNode, useContext, useEffect, useState } from 'react';

import md5 from 'md5';

import { Context, FoxpageStaticComponent, StructureNode } from '@foxpage/foxpage-types';

import { FoxContext } from '@/context/index';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import WithErrorCatch from './WithErrorCatch';

export interface ComposeData {
  node: RenderStructureNode;
  childList?: Array<ReactNode>;
  decorated?: boolean;
  isWrapper: boolean;
  onClick?: FoxBuilderEvents['onSelectComponent'];
}

export interface ExtendInfo {
  fresh?: boolean;
  decoratorInfo?: Record<string, any>;
  $composeData: ComposeData;
}

interface IProps {
  component: RenderStructureNode;
  extendData?: ExtendInfo;
}

const WithHook = (props: IProps) => {
  const [node, setNode] = useState<ReactNode>();
  const [keyStr, setKeyStr] = useState('');
  const [initialProps, setInitialProps] = useState<RenderStructureNode['props']>();
  const { config, loadedComponents } = useContext(FoxContext);
  const { component, extendData } = props;
  const { $composeData, decoratorInfo, fresh } = extendData || {};
  const { childList = [], isWrapper } = $composeData || {};
  const { id, name, label, type, __renderProps: componentProps } = component;
  const core = loadedComponents[component.name];

  useEffect(() => {
    const hook = (core as FoxpageStaticComponent)?.beforeNodeBuild;
    if (typeof hook === 'function') {
      try {
        const ctx = {
          locale: config.page?.locale,
        } as unknown as Context;
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
      const elemProps = {
        ...component.__renderProps,
        ...(isWrapper ? decoratorInfo : {}),
        // TODO: will deprecated
        $decorator: decoratorInfo,
        ...(initialProps || {}),
      };
      const key = md5(JSON.stringify(Object.assign({}, elemProps)));
      setNode(React.createElement(core, elemProps, childList));
      setKeyStr(key);
    }
  }, [component.__renderProps, initialProps, isWrapper, childList, fresh]);

  return (
    <WithErrorCatch
      key={keyStr}
      componentId={id}
      componentName={name}
      componentType={type}
      componentNode={node}
    />
  );
};

export default WithHook;
