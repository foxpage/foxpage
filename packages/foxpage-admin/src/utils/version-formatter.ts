const DIGITS = 3; // number of version displayed

export const formatter = (version: string | number) => {
  const _version =
    typeof version === 'string' && version.indexOf('.') > -1
      ? version.substring(version.lastIndexOf('.') + 1)
      : String(version);

  const willSetNumber = DIGITS - _version.length + 1;

  return Array(willSetNumber).join('0') + _version.toString();
};

export default { formatter };
