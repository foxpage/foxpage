const idStrings: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

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

const shortId = (len = 15) => randStr(len);

export default shortId;
