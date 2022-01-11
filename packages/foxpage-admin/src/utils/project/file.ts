import { ProjectFileType, ProjectType } from '@/types/project';

export const getProjectFile = () => {
  const file = localStorage['foxpage_project_file'] ? JSON.parse(localStorage['foxpage_project_file']) : {};
  return file as ProjectFileType;
};

export const setProjectFile = (file: ProjectFileType) => {
  localStorage['foxpage_project_file'] = JSON.stringify(file || {});
};

export const getProjectFolder = () => {
  const file = localStorage['foxpage_project_folder'] ? JSON.parse(localStorage['foxpage_project_folder']) : {};
  return file as ProjectFileType;
};

export const setProjectFolder = (file: ProjectType) => {
  localStorage['foxpage_project_folder'] = JSON.stringify(file || {});
};

export const isFromWorkspace = (search: string) => {
  return new URLSearchParams(search).get('from') === 'workspace';
};

export const WORKSPACE_URL_PREFIX = 'projects';
export const PROJECT_URL_PREFIX = 'project';

export const getUrlFromParam = (search: string) => {
  return isFromWorkspace(search) ? 'workspace' : 'project';
};
