import { Application } from '@/types/application';

export const getApplication = () => {
  const application = localStorage['foxpage_application'] ? JSON.parse(localStorage['foxpage_application']) : {};
  return application as Application;
};

export const setApplication = (application: Application) => {
  localStorage['foxpage_application'] = JSON.stringify(application || {});
};
