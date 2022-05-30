import _ from 'lodash';

import { ComponentStructure, DslContent, ExtensionData } from '@/types/builder';

/**
 * get the base node
 * @param baseStructureRecord
 * @param item
 * @returns
 */
const getBaseNode = (item: ComponentStructure, baseStructureRecord: ExtensionData['baseStructureRecord'] = {}) => {
  const baseNode = baseStructureRecord[item.id] || baseStructureRecord[item.extension?.extendId || ''];
  return baseNode as ComponentStructure;
};

/**
 * get the all base node positions from list
 * @param list
 * @param baseStructureRecord
 * @returns
 */
const getAllBaseNodePosition = (list: DslContent['schemas'], baseStructureRecord: ExtensionData['baseStructureRecord'] = {}) => {
  const positions: Record<number, number> = {};
  list.forEach((item, index) => {
    const baseNode = getBaseNode(item, baseStructureRecord);
    if (!!baseNode) {
      positions[index] = baseNode.extension?.sort || 100;
    }
  });
  return positions;
};

/**
 * init node position => extension sort
 * 100, 101, 102, 200, 201, 202, 300...
 * => 100, 200, 300 is the base node sort
 * => 101, 102, 201, 202 is the current content node sort
 * @param content
 * @param extension
 */
export const positionInit = (content: DslContent, extension: ExtensionData) => {
  const { baseStructureRecord = {} } = extension;
  function doInit(list: DslContent['schemas']) {
    const baseNodePositions = getAllBaseNodePosition(list, baseStructureRecord);
    const baseNodePositionKeys = Object.keys(baseNodePositions);

    list.forEach((item, index) => {
      const baseNode = getBaseNode(item, baseStructureRecord);
      if (!baseNode) {
        if (!item.extension) {
          item.extension = {};
        }
        // calculate the position(sort)
        // current level whiteout the base node
        if (baseNodePositionKeys.length === 0) {
          item.extension.sort = (index + 1) * 100;
        } else {
          const idx = _.findLastIndex(baseNodePositionKeys, value => index > Number(value));
          if (idx === -1) {
            item.extension.sort = index + 1;
          } else {
            const realIdx = Number(baseNodePositionKeys[idx]);
            const position = baseNodePositions[realIdx];
            item.extension.sort = position + (index - realIdx);
          }
        }
      }

      if (item.children?.length) {
        doInit(item.children);
      }
    });
  }

  doInit(content.schemas);
};
