import qs from 'query-string';

interface SearchParams {
  appId?: string;
  applicationId?: string;
  folderId?: string;
  folderPath?: string;
  folderPage?: string;
  folderSearch?: string;
  fileId?: string;
  filePage?: string;
  fileSearch?: string;
  contentId?: string;
  name?: string;
  searchText?: string;
  type?: string;
  typeId?: string;
  versionId?: string;
  page?: string;
  pageSize?: string;
}

export const getLocationIfo = (location) => {
  const { pathname, search, state } = location;
  const searchParams: SearchParams = qs.parse(search) || '';

  return {
    pathname,
    search,
    ...searchParams,
    ...state,
  };
};

export default { getLocationIfo };
