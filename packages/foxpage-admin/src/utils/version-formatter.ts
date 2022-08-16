const DIGITS = 3; // number of version displayed

export const formatter = (version: string | number) => {
  let willSetNumber = DIGITS;
  if (typeof version === 'number') {
    willSetNumber = DIGITS - version.toString().length + 1;
  }
  if (typeof version === 'string') {
    willSetNumber = DIGITS - version.length + 1;
  }
  return Array(willSetNumber).join('0') + version.toString();
};

export default { formatter };
