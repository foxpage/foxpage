import { createAction } from 'typesafe-actions';

import { Notice } from '@/types/index';

export const clearAll = createAction('SYSTEM_NOTICE__CLEAR_ALL', () => ({}))();

export const fetchNotices = createAction('SYSTEM_NOTICE__FETCH_NOTICES', () => ({}))();

export const pushNotices = createAction('SYSTEM_NOTICE__PUSH_NOTICES', (list: Notice[]) => ({
  list,
}))();
