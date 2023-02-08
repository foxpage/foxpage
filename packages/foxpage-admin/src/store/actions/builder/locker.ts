import { createAction } from 'typesafe-actions';

export const updateClientContentTime = createAction(
  'BUILDER_LOCKER__UPDATE_CONTENT_TIME_LOCAL',
  (clientUpdateTime) => ({ clientUpdateTime }),
)();

export const resetClientContentTime = createAction('BUILDER_LOCKER__RESET_CONTENT_TIME_LOCAL', () => ({}))();
