import { privateDecrypt } from 'crypto';
import fs from 'fs';

import _ from 'lodash';

const idStrings: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const keyString: string = fs.readFileSync('config/crypto-key.json', 'utf8').toString();
const cryptokey: { publicKey: string; privateKey: string } = JSON.parse(keyString);

/**
 * Decrypt the password of the buffer into a string
 * @param  {Buffer} password
 * @returns string
 */
export function decryptPwd(password: Buffer): string {
  const decryptPwd: string = privateDecrypt(
    { key: cryptokey.privateKey, passphrase: '' },
    Buffer.from(password),
  ).toString('base64');

  return decryptPwd;
}

/**
 *Generate ID,
 * @param pre ID prefix
 * appl: application
 * fold: folder
 * file: file
 * cont: content
 * cver: content version
 * orga: organization
 * team: team
 * regi: registry
 * temp: template
 * user: user
 * stru: structure
 * stor: store
 * rsos: resource
 * @param  {string} pre
 * @returns string
 */
export function generationId(pre: string): string {
  return [pre, randStr(15)].join('_');
}

/**
 * Generate random string
 * @param  {} number=2
 */
export function randStr(number: number = 2): string {
  let str = '';
  for (let i = 0; i < number; i++) {
    const pos = Math.round(Math.random() * (idStrings.length - 1));
    str += idStrings[pos];
  }

  return str;
}

/**
 * Process _id in the object as id
 * @param  {any[]} sourceData
 * @returns any
 */
export function prettifyId(sourceData: any[]): any[] {
  if (sourceData.length > 0) {
    sourceData.map((cell) => {
      for (const item in cell) {
        if (item === '_id') {
          cell['id'] = cell['_id'];
          cell['_id'] = undefined;
        } else if (typeof cell[item] === 'object') {
          cell[item] = prettifyId([cell[item]])[0];
        }
      }
    });
  }

  return sourceData;
}

/**
 * To check the validity of the data name, you can only enter numbers,
 * letters, spaces, underscores, underscores, @, /, valid returns true, invalid returns false
 * @param  {string} name
 * @returns boolean
 */
export function checkName(name: string): boolean {
  const illegalStr: number = name.search(/[^0-9a-zA-Z\-\_\/\@\. ]/);
  return illegalStr === -1;
}

/**
 * Check resource folder name, include '.'
 * @param  {string} name
 * @returns boolean
 */
export function checkResourceName(name: string): boolean {
  const illegalStr: number = name.search(/[^0-9a-zA-Z\-\_\/\@\. ]/);
  return illegalStr === -1;
}

/**
 * Check the validity of the mailbox, return true if it is valid, return false if it is invalid
 * @param  {string} email
 * @returns boolean
 */
export function checkEmail(email: string): boolean {
  const reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return reg.test(email);
}

/**
 * Format the name of the file/folder into a path format, such as: Test Name => test-name
 * ignore transform dot '.'
 * @param  {string} name
 * @returns string
 */
export function formatToPath(name: string): string {
  return _.trim(_.toLower(name).replace(/[^0-9a-z]/g, ' ')).replace(/\s+/g, '-');
}

/**
 * merge page url from host, slug and path
 * @param host
 * @param path
 * @param slug
 * @returns
 */
export function mergeUrl(host: string, path: string, slug?: string): string {
  return _.trimEnd(host, '/') + '/' + _.trim(slug, '/') + '/' + _.trimStart(path, '/');
}

/**
 * format number to mask list, eg. 15 => [1, 2, 4, 8]
 * @param authValue
 * @returns
 */
export function authToMask(authValue: number): number[] {
  let authList: number[] = [];
  for (let i = 0; ; i++) {
    if (Math.pow(2, i) > authValue) {
      break;
    }
    authList.push(Math.pow(2, i));
  }

  return authList;
}

/**
 * format multi auth mask to array
 * @param authMasks
 * @returns
 */
export function authListToMask(authMasks: number[]): number[] {
  let autList: number[] = [];
  for (const auth of authMasks) {
    autList = _.concat(autList, authToMask(auth));
  }

  return _.uniq(autList);
}
