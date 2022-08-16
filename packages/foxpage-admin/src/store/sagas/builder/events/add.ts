import { Component, FormattedData } from '@/types/index';

import { initNode, initStyleWrapper } from '../utils';

/**
 * add component
 * @param component component detail
 * @returns new node
 */
export const addComponent = (component: Component, opt: { componentMap: FormattedData['componentMap'] }) => {
  const node = initNode(component);

  const nodeComponent = opt.componentMap[node.name] || {};
  // if use style editor ,will wrapper a styleContainer
  if (nodeComponent.useStyleEditor) {
    return initStyleWrapper(node, opt.componentMap);
  }

  return node;
};
