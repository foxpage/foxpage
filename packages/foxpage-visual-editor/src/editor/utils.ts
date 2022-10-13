import { RenderStructureNode } from "@/types/index";

export const getState = (newData: RenderStructureNode, cached: RenderStructureNode) => {
  return  {
    ...cached,
    ...newData,
    props: {
      ...cached.props,
      ...newData.props,
    },
    directive: {
      ...(cached.directive || {}),
      ...(newData.directive || {}),
    },
    __styleNode: {
      ...(cached.__styleNode || {}),
      ...(newData.__styleNode || {}),
    } as RenderStructureNode['__styleNode'],
  };
}

export const getCoveredState = (newData: RenderStructureNode, cached: RenderStructureNode) => {
  return  {
    ...cached,
    ...newData,
    props: {
      ...newData.props,
      ...cached.props,
    },
    directive: {
      ...(newData.directive || {}),
      ...(cached.directive || {}),
    },
    __styleNode: {
      ...(newData.__styleNode || {}),
      ...(cached.__styleNode || {}),
    } as RenderStructureNode['__styleNode'],
  };
}
