import axios from 'axios';

import { IndexContent, ResourceListOptions } from '@foxpage/foxpage-server-types';

export const getManifestContent = async (options: ResourceListOptions): Promise<Record<string, string>> => {
  const host = options.resourceConfig?.ares?.registry || '';
  const manifestPath = options.groupConfig?.manifestPath || '';

  if (!host || !manifestPath) {
    return {};
  }

  const { data } = await axios({
    method: 'get',
    url: host + manifestPath,
  });

  return data;
};

export const getIndexContent = async (url: string): Promise<IndexContent> => {
  const { data } = await axios({ method: 'get', url });
  (data?.packages || []).forEach((item) => {
    item.foxpage.resourceName = item.foxpage.dirName || '';
    delete item.dirName;
  });
  return data;
};

export const mergeManifestAndIndexContent = (
  manifestContent: Record<string, string>,
  indexContent: IndexContent,
): any => {
  const groupComponent = groupManifestComponent(manifestContent);

  for (const component of indexContent.packages) {
    if (groupComponent[component.foxpage.resourceName]) {
      component.files = groupComponent[component.foxpage.resourceName];
    }
  }

  return indexContent;
};

const groupManifestComponent = (manifestContent: Record<string, string>): any => {
  let groupComponent: Record<string, any> = {};
  for (const item in manifestContent) {
    const itemArr = item.split('/');
    const itemArrLen = itemArr.length;
    if (itemArrLen === 1) {
      continue;
    }

    if (!groupComponent[itemArr[1]]) {
      groupComponent[itemArr[1]] = {};
    }

    // The ares manifest path max item is 4
    if (itemArrLen === 4) {
      if (!groupComponent[itemArr[1]][itemArr[2]]) {
        groupComponent[itemArr[1]][itemArr[2]] = {};
      }

      groupComponent[itemArr[1]][itemArr[2]][itemArr[3]] = manifestContent[item];
    } else if (itemArr[2] !== 'foxpage.json') {
      groupComponent[itemArr[1]][itemArr[2]] = manifestContent[item];
    }
  }

  return groupComponent;
};
