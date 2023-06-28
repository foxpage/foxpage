import { StoreFileResource } from '@/types/index';

export const getImageUrlByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  // @ts-ignore
  return __DEV__ ? `${link}` : `${APP_CONFIG.slug}/dist${link}`;
};

export const getContentsFirstPicture = (contents: Array<StoreFileResource>) => {
  const content = contents.find((item) => item?.pictures?.[0]?.url !== undefined);
  if (content) {
    return content.pictures[0].url;
  } else {
    return getImageUrlByEnv('/images/placeholder.png');
  }
};
