// @ts-ignore
import localforage from 'localforage';

import { PageContent } from '@/types/index';
import { decrypt, encrypt } from '@/utils/index';

export const BUILDER_DSL = 'BUILDER.DSL';
export const MAX_CACHED_NUM = 15;

type Cached = {
  id: string;
  contents: PageContent[];
  curStep: number;
};

/**
 * cache content
 * @param content page content;
 */
export const cache = async (content: PageContent, curStep: number) => {
  const key = content.contentId;
  const caches = await getCached(key);
  // remove first
  if (caches.length > MAX_CACHED_NUM) {
    caches.shift();
  }
  caches.push(content);
  const cached = { id: key, contents: caches, curStep };
  localforage.setItem(BUILDER_DSL, encrypt(JSON.stringify(cached)));
  return caches.length;
};

export const setCurStep = async (key: string, step: number = 0, content: PageContent) => {
  const caches = await getCached(key);
  // caches
  if (caches.length > MAX_CACHED_NUM) {
    caches.shift();
  }
  caches.push(content);
  const cached = { id: key, contents: caches, curStep: step };
  localforage.setItem(BUILDER_DSL, encrypt(JSON.stringify(cached)));
  return caches.length;
};

/**
 * get cur step
 * @param key
 * @returns
 */
export const getCurStep = async (key: string) => {
  const cached = await getCacheData();
  if (cached.id === key) {
    return cached.curStep || 0;
  }
  return 0;
};

/**
 * get cached by key(content id)
 * @returns contents
 */
export const getCached = async (key: string) => {
  const cached = await getCacheData();
  if (cached.id === key) {
    return cached.contents;
  }
  return [];
};

/**
 * check exist
 * @param key
 * @returns
 */
export const checkExist = async (key: string) => {
  const cached = await getCacheData();
  return cached.id === key;
};

/**
 * clear cache by key
 */
export const clearCache = async (key: string) => {
  const exist = await checkExist(key);
  if (!exist) {
    await localforage.removeItem(BUILDER_DSL);
  }
};

const getCacheData = async () => {
  try {
    const cachedStr = await localforage.getItem<string>(BUILDER_DSL);
    const cached = cachedStr ? (JSON.parse(decrypt(cachedStr)) as Cached) : ({} as Cached);
    return cached || ({} as Cached);
  } catch (error) {
    console.error('[ GET CACHED FAILED ]', error);
    return {} as Cached;
  }
};
