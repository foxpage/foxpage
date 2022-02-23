const getImageUrlByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  return __DEV__ ? `${link}` : `/${APP_CONFIG.slug}/dist${link}`;
};

export default getImageUrlByEnv;
