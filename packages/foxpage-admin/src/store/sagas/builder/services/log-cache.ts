import { RecordLog } from '@/types/index';
import { decrypt, encrypt } from '@/utils/index';

export const BUILDER_LOG = 'FOXPAGE.BUILDER_LOG';

/**
 * cache logs
 * @param logs page logs;
 */
export const cacheLogs = (key: string, logs: RecordLog[] = []) => {
  const value = {
    contentId: key,
    logs,
  };
  localStorage.setItem(BUILDER_LOG, encrypt(JSON.stringify(value)));
};

/**
 * get cached by key(content id)
 * @returns logs
 */
export const getCachedLogs = (key: string) => {
  try {
    const cachedStr = localStorage.getItem(BUILDER_LOG);
    const cached = cachedStr ? JSON.parse(decrypt(cachedStr)) : {};
    if (cached.contentId === key) {
      return cached.logs;
    }
    return [];
  } catch (error) {
    console.error('[ GET CACHED FAILED ]', error);
    return [] as RecordLog[];
  }
};

/**
 * clear cached by key
 */
export const clearCacheLogs = (_key: string) => {
  localStorage.removeItem(BUILDER_LOG);
};
