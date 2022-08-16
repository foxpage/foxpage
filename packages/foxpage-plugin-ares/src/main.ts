import * as _ from 'lodash';

import { FoxpagePlugin } from '@foxpage/foxpage-plugin';
import { IndexContent, ResourceAbstract, ResourceListOptions } from '@foxpage/foxpage-server-types';

import { getIndexContent, getManifestContent, getRemotePath, mergeManifestAndIndexContent } from './functions';

const PLUGIN_NAME = 'ares';

const Ares = (): FoxpagePlugin<ResourceAbstract> => {
  return {
    name: 'foxpage-ares',
    visitor: {
      resourceList: async (options: ResourceListOptions): Promise<IndexContent> => {
        let groupResources: IndexContent = { type: PLUGIN_NAME, group: '', packages: [] };

        if (!options.type || options.type.toLowerCase() !== PLUGIN_NAME) {
          return groupResources;
        }

        try {
          const manifestContent = await getManifestContent(options);

          const indexPath = manifestContent['foxpages.json'] || '';
          if (indexPath) {
            // Get group component info list
            const indexContent = await getIndexContent(options.resourceConfig?.ares?.static + indexPath);

            groupResources = mergeManifestAndIndexContent(manifestContent, indexContent);
            groupResources.type = PLUGIN_NAME;
          }

          return groupResources;
        } catch (err) {
          return groupResources;
        }
      },
      resourceRemoteUrl: (options: ResourceListOptions): Record<string, string> => {
        const path = getRemotePath(options.groupConfig || {});
        const pathArr = _.pullAll(_.trim(path).split('/'), ['']);

        return {
          type: PLUGIN_NAME,
          url: (options.resourceConfig?.ares?.registry || '') + '/' + pathArr.join('/'),
        };
      }
    },
    options: {},
  };
};

export default Ares;
