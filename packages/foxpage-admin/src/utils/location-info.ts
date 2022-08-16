import qs from 'query-string';

interface SearchParams {
  applicationId?: string;
  folderId?: string;
  folderPath?: string;
  fileId?: string;
  contentId?: string;
  name?: string;
}

export const getLocationIfo = (location) => {
  const { pathname, search } = location;
  const searchParams: SearchParams = qs.parse(search) || '';

  return {
    pathname,
    search,
    ...searchParams,
  };
};

export default { getLocationIfo };
