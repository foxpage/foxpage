import { PageContent } from '@/types/index';
import { decrypt, encrypt } from '@/utils/index';

export const BUILDER_DSL = 'BUILDER.DSL';
export const MAX_CACHED_NUM = 15;

type Cached = {
  id: string;
  contents: PageContent[];
};

/**
 * cache content
 * @param content page content;
 */
export const cache = (content: PageContent) => {
  const key = content.contentId;
  const caches = getCached(key);

  // remove first
  if (caches.length > MAX_CACHED_NUM) {
    caches.shift();
  }

  caches.push(content);
  const cached = { id: key, contents: caches };
  // console.log('[ CACHED ]', cached);
  localStorage.setItem(BUILDER_DSL, encrypt(JSON.stringify(cached)));
  return caches.length;
};

/**
 * get cached by key(content id)
 * @returns contents
 */
export const getCached = (key: string) => {
  try {
    const cachedStr = localStorage.getItem(BUILDER_DSL);
    const cached = cachedStr ? (JSON.parse(decrypt(cachedStr)) as Cached) : ({} as Cached);
    // console.log('[ GET CACHED ]', key, cached);
    if (cached.id === key) {
      return cached.contents;
    }
    return [];
  } catch (error) {
    console.error('[ GET CACHED FAILED ]', error);
    return [] as PageContent[];
  }
};

/**
 * clear cache by key
 */
export const clearCache = () => {
  // console.log('[ CLEAR CACHE ]');
  localStorage.setItem(BUILDER_DSL, encrypt(JSON.stringify({})));
};
