import {
  CONDITION_ACTIONS,
  FUNCTION_ACTIONS,
  PAGE_ACTIONS,
  RecordActionType,
  STRUCTURE_ACTIONS,
  VARIABLE_ACTIONS,
} from '@/constants/index';
import { ActionRecordItem, RecordLog, StructureNode } from '@/types/index';
import { getLoginUser } from '@/utils/login-user';
import shortId from '@/utils/short-id';

import { wrapperSchema } from '../builder/utils';

export const initPageLog = (value: Record<string, any>) => {
  return { type: 'page', id: value.id, content: JSON.stringify(value) } as ActionRecordItem;
};

export const initStructureLog = (value: Record<string, any>) => {
  const fullSnapshot = wrapperSchema([value as StructureNode], false);
  return { type: 'structure', id: value.id, content: JSON.stringify(fullSnapshot[0]) } as ActionRecordItem;
};

export const initVariableLog = (value: Record<string, any>) => {
  return { type: 'variable', id: value.id, content: JSON.stringify(value) } as ActionRecordItem;
};

export const initConditionLog = (value: Record<string, any>) => {
  return { type: 'condition', id: value.id, content: JSON.stringify(value) } as ActionRecordItem;
};

export const initFunctionLog = (value: Record<string, any>) => {
  return { type: 'function', id: value.id, content: JSON.stringify(value) } as ActionRecordItem;
};

const initLogContent = (action: RecordActionType, detail: Record<string, any>) => {
  if (PAGE_ACTIONS.indexOf(action) > -1) {
    return initPageLog(detail);
  }
  if (STRUCTURE_ACTIONS.indexOf(action) > -1) {
    return initStructureLog(detail);
  }
  if (VARIABLE_ACTIONS.indexOf(action) > -1) {
    return initVariableLog(detail);
  }
  if (CONDITION_ACTIONS.indexOf(action) > -1) {
    return initConditionLog(detail);
  }
  if (FUNCTION_ACTIONS.indexOf(action) > -1) {
    return initFunctionLog(detail);
  }
};

export const initRecordLog = (action: RecordActionType, contents: Record<string, any>[] = []) => {
  return {
    id: shortId(),
    action,
    content: contents.map((item) => initLogContent(action, item)),
    createTime: new Date().getTime(),
    creator: getLoginUser().userInfo,
  } as unknown as RecordLog;
};
