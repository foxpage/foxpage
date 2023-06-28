import { createAction } from 'typesafe-actions';

import { UserOrganization } from '@/types/index';

export const fetchOrganizationList = createAction('SYSTEM__FETCH_ORGANIZATION_LIST', () => ({}))();

export const pushOrganizationList = createAction(
  'SYSTEM__PUSH_ORGANIZATION_LIST',
  (list: UserOrganization[]) => ({
    list,
  }),
)();

export const updateOrganizationId = createAction('SYSTEM__UPDATE_ORGANIZATION_ID', (id: string) => ({
  id,
}))();
