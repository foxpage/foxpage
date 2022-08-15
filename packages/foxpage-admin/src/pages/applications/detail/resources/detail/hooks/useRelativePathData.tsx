import { useMemo } from 'react';
import { useLocation, useParams, useRouteMatch } from 'react-router-dom';

const useRelativePathData = () => {
  const { resourceRoot } = useParams<{ resourceRoot: string }>();
  const { url: matchUrl } = useRouteMatch();
  const { pathname, search } = useLocation();

  const relativePath = useMemo(() => {
    return pathname.slice(pathname.indexOf(matchUrl) + matchUrl.length).replace(/^\//, '');
  }, [pathname, matchUrl]);

  const relativePathBreadCrumb = useMemo(() => {
    return `${relativePath || ''}`
      .split('/')
      .filter(Boolean)
      .reduce(
        (arr, name) => {
          arr.push({
            name,
            link: `${arr[arr.length - 1].link}/${name}`,
          });
          return arr;
        },
        [
          {
            name: resourceRoot,
            link: `/#${matchUrl}${search}`,
          },
        ],
      );
  }, [relativePath]);

  return {
    folderPath: `${resourceRoot}${relativePath ? '/' : ''}${relativePath || ''}`,
    relativePath,
    relativePathBreadCrumb,
  };
};

export default useRelativePathData;
