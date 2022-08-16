import { ProjectFile } from '@/types/index';

export const getProjectFolder = () => {
  const file = localStorage['foxpage_project_folder']
    ? JSON.parse(localStorage['foxpage_project_folder'])
    : {};
  return file as ProjectFile;
};

export default { getProjectFolder };
