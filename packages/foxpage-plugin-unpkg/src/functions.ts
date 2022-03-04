import axios from 'axios';
import * as _ from 'lodash';

import { IndexContentPkg } from '@foxpage/foxpage-server-types';

export interface NpmRes {
  name: string;
  scope: string;
  version: string;
}

export interface UnpkgManifest {
  name: string;
  version: string;
  manifest: Record<string, string>;
}

export interface UnpkgFoxpage {
  name: string;
  version: string;
  foxpage: {
    name: string;
    version: string;
    schema: Record<string, any>;
    meta: Record<string, any>;
  };
}

const UNPKG_HOST = 'https://www.unpkg.com/';

/**
 * Search from npm by the special text, only response 20 packages
 * @param  {{name?:string}} options
 * @returns Promise
 */
export const searchNpmPackage = async (options: { packageName?: string }): Promise<NpmRes[]> => {
  if (!options.packageName) {
    return [];
  }

  const { data } = await axios({
    method: 'get',
    url: 'https://registry.npmjs.com/-/v1/search?text=' + options.packageName + '&size=20',
  });
  return _.map(data.objects || [], (pkg) => _.pick(pkg.package || {}, ['name', 'scope', 'version']));
};

/**
 * Get package manifest file path from unpkg
 * @param  {{name:string;version:string;}} options
 * @returns Promise
 */
export const getPackageManifest = async (options: {
  name: string;
  version: string;
}): Promise<UnpkgManifest> => {
  try {
    const { data } = await axios({
      method: 'get',
      url: UNPKG_HOST + options.name + '@' + options.version + '/dist/manifest.json',
    });
    return Object.assign({ manifest: data }, options);
  } catch (err) {
    return Object.assign({ manifest: {} }, options);
  }
};

/**
 * Get package foxpage json file data
 * @param  {{name:string;version:string}} options
 */
export const getPackageFoxpage = async (options: {
  name: string;
  version: string;
}): Promise<UnpkgFoxpage> => {
  try {
    const { data } = await axios({
      method: 'get',
      url: UNPKG_HOST + options.name + '@' + options.version + '/dist/foxpage.json',
    });
    return Object.assign({ foxpage: data?.foxpage || {} }, options);
  } catch (err) {
    return Object.assign({ foxpage: <any>{} }, options);
  }
};

/**
 * format response resource structure to {name,version,dirName,files}
 * @param  {UnpkgManifest[]} manifestList
 * @returns IndexContentPkg
 */
export const formatResponse = (
  manifestList: UnpkgManifest[],
  pkgFoxpageData: UnpkgFoxpage[],
): IndexContentPkg[] => {
  let resources: IndexContentPkg[] = [];

  const pkgFoxpageObject: Record<string, UnpkgFoxpage> = _.keyBy(pkgFoxpageData, (pkg) => {
    return pkg.name + '@' + pkg.version;
  });

  manifestList.forEach((pkg) => {
    if (!_.isEmpty(pkg.manifest)) {
      let manifestFile: Record<string, any> = {};
      for (const key in pkg.manifest) {
        const tmpFile = transformArrToObject(
          key.split('/'),
          _.startsWith(pkg.manifest[key], '/') ? '' : '/' + pkg.manifest[key],
        );
        manifestFile = _.merge(manifestFile, tmpFile);
      }

      resources.push({
        name: pkg.name,
        version: pkg.version,
        foxpage: Object.assign(
          { resourceName: pkg.name },
          pkgFoxpageObject[pkg.name + '@' + pkg.version]?.foxpage,
        ),
        files: manifestFile,
      });
    }
  });

  return resources;
};

/**
 * transform array to recursive object, eg. ['a','b','c'] => {a: {b:c}}
 * @param  {string[]} keyArr
 * @param  {string} value
 * @returns any
 */
const transformArrToObject = (keyArr: string[], value: string): any => {
  let itemObject: any = {};
  for (const key of _.reverse(keyArr)) {
    if (key === _.first(keyArr)) {
      itemObject[key] = value;
    } else {
      itemObject = { [key]: itemObject };
    }
  }
  return itemObject;
};
