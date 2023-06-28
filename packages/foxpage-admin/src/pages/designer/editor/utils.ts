import { RenderStructureNode } from '@/types/index';

export const getCoveredState = (selected: RenderStructureNode, cached: RenderStructureNode) => {
  if ((selected?.__lastModified || 0) > (cached?.__lastModified || 0)) {
    return getCoveredState(cached, selected);
  }
  return {
    ...cached,
    ...selected,
    props: Object.assign({}, selected.props, cached.props),
    directive: Object.assign({}, selected.directive, cached.directive),
    __styleNode: {
      ...(cached.__styleNode || {}),
    } as RenderStructureNode['__styleNode'],
  };
};
