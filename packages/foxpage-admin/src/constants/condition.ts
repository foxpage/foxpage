export enum ConditionTypeEnum {
  empty = 0,
  and = 1,
  or = 2,
}

export const eqRelations = { value: 'eq', desc: 'equals' };
export const ltEqRelations = { value: 'lt_eq', desc: 'less than or equal to' };
export const gtQqRelations = { value: 'gt_eq', desc: 'greater than or equal to' };

export const operations: any = [
  { key: 1, value: 'and' },
  { key: 2, value: 'or' },
];

const ConditionType = Object.freeze(['and', 'or']);

const ConditionFormula = Object.freeze([
  { value: 'eq', label: 'equals' },
  { value: 'ct', label: 'contains' },
  { value: 'sw', label: 'start with' },
  { value: 'ew', label: 'end with' },
  { value: 'regex', label: 'matches RegEx' },
  { value: 'regex_uncase', label: 'matches RegEx (ignore case)' },
  { value: 'un_eq', label: 'does not equal' },
  { value: 'un_ct', label: 'does not contain' },
  { value: 'un_sw', label: 'does not start with' },
  { value: 'un_ew', label: 'does not end with' },
  { value: 'un_regex', label: 'does not matches RegEx' },
  { value: 'un_regex_uncase', label: 'does not matches RegEx(ignore case)' },
  { value: 'lt', label: 'less than' },
  { value: 'lt_eq', label: 'less than or equal to' },
  { value: 'gt', label: 'greater than' },
  { value: 'gt_eq', label: 'greater than or equal to' },
  { value: 'in_array', label: 'in array' },
  { value: 'un_in_array', label: 'not in array' },
]);

export { ConditionFormula, ConditionType };
