export enum RecordActionType {
  // page
  PAGE_CLONE = 0,
  PAGE_PUBLISH = 1,
  PAGE_PRE_STEP = 2,
  PAGE_NEXT_STEP = 3,
  // structure
  STRUCTURE_CREATE = 10,
  STRUCTURE_UPDATE = 11,
  STRUCTURE_UPDATE_BATCH = 12,
  STRUCTURE_REMOVE = 13,
  STRUCTURE_MOVE = 14,
  STRUCTURE_RECOVER = 15,
  // variable
  VARIABLE_CREATE = 20,
  VARIABLE_UPDATE = 21,
  VARIABLE_REMOVE = 22,
  VARIABLE_PUBLISH = 23,
  // condition
  CONDITION_CREATE = 30,
  CONDITION_UPDATE = 31,
  CONDITION_REMOVE = 32,
  CONDITION_PUBLISH = 33,
  // function
  FUN_CREATE = 40,
  FUN_UPDATE = 41,
  FUN_REMOVE = 42,
  FUN_PUBLISH = 43,
}

export const PAGE_ACTIONS = [
  RecordActionType.PAGE_CLONE,
  RecordActionType.PAGE_PUBLISH,
  RecordActionType.PAGE_PRE_STEP,
  RecordActionType.PAGE_NEXT_STEP,
];

export const STRUCTURE_ACTIONS = [
  RecordActionType.STRUCTURE_CREATE,
  RecordActionType.STRUCTURE_MOVE,
  RecordActionType.STRUCTURE_REMOVE,
  RecordActionType.STRUCTURE_UPDATE,
  RecordActionType.STRUCTURE_UPDATE_BATCH,
  RecordActionType.STRUCTURE_RECOVER,
];

export const VARIABLE_ACTIONS = [
  RecordActionType.VARIABLE_CREATE,
  RecordActionType.VARIABLE_PUBLISH,
  RecordActionType.VARIABLE_REMOVE,
  RecordActionType.VARIABLE_UPDATE,
];

export const CONDITION_ACTIONS = [
  RecordActionType.CONDITION_CREATE,
  RecordActionType.CONDITION_PUBLISH,
  RecordActionType.CONDITION_REMOVE,
  RecordActionType.CONDITION_UPDATE,
];

export const FUNCTION_ACTIONS = [
  RecordActionType.FUN_CREATE,
  RecordActionType.FUN_PUBLISH,
  RecordActionType.FUN_REMOVE,
  RecordActionType.FUN_UPDATE,
];

export const CREATE_ACTION = 'add';
export const UPDATE_ACTION = 'update';
export const REMOVE_ACTION = 'remove';
export const MOVE_ACTION = 'move';
export const RECOVER_ACTION = 'recover';
export const PUBLISH_ACTION = 'publish';
export const BATCH_UPDATE_ACTION = 'updateBatch';
export const CLONE_ACTION = 'clone';
export const PRE_STEP_ACTION = 'preStep';
export const NEXT_STEP_ACTION = 'nextStep';

export const actionConfig = {
  // page
  [RecordActionType.PAGE_CLONE]: {
    text: CLONE_ACTION,
    textColor: 'green',
  },
  [RecordActionType.PAGE_PUBLISH]: {
    text: PUBLISH_ACTION,
    textColor: '#f90',
  },
  [RecordActionType.PAGE_PRE_STEP]: {
    text: PRE_STEP_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.PAGE_NEXT_STEP]: {
    text: NEXT_STEP_ACTION,
    textColor: '#1890ff',
  },
  // structure
  [RecordActionType.STRUCTURE_CREATE]: {
    text: CREATE_ACTION,
    textColor: 'green',
  },
  [RecordActionType.STRUCTURE_UPDATE]: {
    text: UPDATE_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.STRUCTURE_UPDATE_BATCH]: {
    text: BATCH_UPDATE_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.STRUCTURE_REMOVE]: {
    text: REMOVE_ACTION,
    textColor: '#ff4747',
  },
  [RecordActionType.STRUCTURE_MOVE]: {
    text: MOVE_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.STRUCTURE_RECOVER]: {
    text: RECOVER_ACTION,
    textColor: '#FFA217',
  },
  // variable
  [RecordActionType.VARIABLE_CREATE]: {
    text: CREATE_ACTION,
    textColor: 'green',
  },
  [RecordActionType.VARIABLE_UPDATE]: {
    text: UPDATE_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.VARIABLE_REMOVE]: {
    text: REMOVE_ACTION,
    textColor: '#ff4747',
  },
  [RecordActionType.VARIABLE_PUBLISH]: {
    text: PUBLISH_ACTION,
    textColor: '#f90',
  },
  // condition
  [RecordActionType.CONDITION_CREATE]: {
    text: CREATE_ACTION,
    textColor: 'green',
  },
  [RecordActionType.CONDITION_UPDATE]: {
    text: UPDATE_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.CONDITION_REMOVE]: {
    text: REMOVE_ACTION,
    textColor: '#ff4747',
  },
  [RecordActionType.CONDITION_PUBLISH]: {
    text: PUBLISH_ACTION,
    textColor: '#f90',
  },
  // function
  [RecordActionType.FUN_CREATE]: {
    text: CREATE_ACTION,
    textColor: 'green',
  },
  [RecordActionType.FUN_UPDATE]: {
    text: UPDATE_ACTION,
    textColor: '#1890ff',
  },
  [RecordActionType.FUN_REMOVE]: {
    text: REMOVE_ACTION,
    textColor: '#ff4747',
  },
  [RecordActionType.FUN_PUBLISH]: {
    text: PUBLISH_ACTION,
    textColor: '#f90',
  },
};
