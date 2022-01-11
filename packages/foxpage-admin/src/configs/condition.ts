export const condition = [
  // 'ipCountryCode',
  // 'customerField',
  // 'Locale',
  // 'Platform',
  // 'Banner',
  // 'Version',
];

export const eqRelations = { value: 'eq', desc: 'equals' };
export const ltEqRelations = { value: 'lt_eq', desc: 'less than or equal to' };
export const gtQqRelations = { value: 'gt_eq', desc: 'greater than or equal to' };

export const relations: any = [
  eqRelations,
  { value: 'ct', desc: 'contains' },
  { value: 'sw', desc: 'start with' },
  { value: 'ew', desc: 'end with' },
  { value: 'regex', desc: 'matches RegEx' },
  { value: 'regex_uncase', desc: 'matches RegEx (ignore case)' },
  { value: 'un_eq', desc: 'does not equal' },
  { value: 'un_ct', desc: 'does not contain' },
  { value: 'un_sw', desc: 'does not start with' },
  { value: 'un_ew', desc: 'does not end with' },
  { value: 'un_regex', desc: 'does not matches RegEx' },
  { value: 'un_regex_uncase', desc: 'does not matches RegEx(ignore case)' },
  { value: 'lt', desc: 'less than' },
  ltEqRelations,
  { value: 'gt', desc: 'greater than' },
  gtQqRelations,
  { value: 'in_array', desc: 'in array' },
  { value: 'un_in_array', desc: 'not in array' },
];

export const operations: any = [
  { key: 1, value: 'and' },
  { key: 2, value: 'or' },
];
