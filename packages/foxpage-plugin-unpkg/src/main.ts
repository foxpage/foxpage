import * as _ from 'lodash';

import { FoxpagePlugin } from '@foxpage/foxpage-plugin';
import { IndexContent, ResourceAbstract, ResourceListOptions } from '@foxpage/foxpage-server-types';

import {
  formatResponse,
  getPackageFoxpage,
  getPackageManifest,
  searchNpmPackage,
  UnpkgManifest,
} from './functions';

const PLUGIN_NAME = 'unpkg';

const Unpkg = (): FoxpagePlugin<ResourceAbstract> => {
  return {
    name: 'foxpage-unpkg',
    visitor: {
      resourceList: async (options: ResourceListOptions): Promise<IndexContent> => {
        if (!options.type || options.type.toLowerCase() !== PLUGIN_NAME) {
          return { type: PLUGIN_NAME, group: '', packages: [] };
        }

        // Search package from npm
        const npmPkgList = await searchNpmPackage(options);

        // Get folder path from unpkg
        let pkgManifestList: UnpkgManifest[] = [];
        let pkgFoxpageData: any[] = [];
        if (npmPkgList.length > 0) {
          for (const pkgBlock of _.chunk(npmPkgList, 20)) {
            const blockPkgManifestList = await Promise.all(pkgBlock.map((pkg) => getPackageManifest(pkg)));
            const blockPkgFoxpageData = await Promise.all(pkgBlock.map((pkg) => getPackageFoxpage(pkg)));
            pkgManifestList = pkgManifestList.concat(blockPkgManifestList);
            pkgFoxpageData = pkgFoxpageData.concat(blockPkgFoxpageData);
          }
        }

        let groupResources: IndexContent = { type: PLUGIN_NAME, group: '', packages: [] };
        if (pkgManifestList.length > 0) {
          groupResources.packages = formatResponse(pkgManifestList, pkgFoxpageData);
        }

        return groupResources;
      },
      resourceRemoteUrl (options: ResourceListOptions): Record<string, any> {
        return {
          type: PLUGIN_NAME,
          url: 'https://registry.npmjs.com/-/v1/search?text=' +
            _.trim((options.groupConfig?.resourceScope || options.packageName))
        };
      }
    },
    options: {},
  };
};

export default Unpkg;
