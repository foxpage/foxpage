export const getImageUrlByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  // @ts-ignore
  return __DEV__ ? `${link}` : `${APP_CONFIG.slug}/dist${link}`;
};
