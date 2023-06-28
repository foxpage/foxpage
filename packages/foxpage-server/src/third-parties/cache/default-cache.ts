import _ from 'lodash';

class DefaultCache {
  constructor() {}

  /**
   * get cache value
   * @param key
   * @returns
   */
  async get(key: string): Promise<string> {
    console.log('get cache [' + key + ']');
    return '';
  }

  /**
   * set cache value
   * @param key
   * @param value
   */
  async set(key: string, value: string, expired?: number): Promise<void> {
    console.log(
      [
        'set cache [',
        key,
        '] as value ',
        _.truncate(value, { length: 10 }),
        ', expired after ',
        expired,
        ' sec',
      ].join(''),
    );
  }

  /**
   * remove cache
   * @param key
   */
  async remove(key: string): Promise<void> {
    console.log('remove cache [' + key + ']');
  }
}

export default DefaultCache;
