import qs from 'query-string';

interface SearchParams {
  applicationId?: string;
  folderId?: string;
  fileId?: string;
  contentId?: string;
}

function getLocationIfo(location) {
  const { pathname, search } = location;
  const searchParams: SearchParams = qs.parse(search) || '';

  return {
    pathname,
    search,
    ...searchParams,
  };
}

export default getLocationIfo;
