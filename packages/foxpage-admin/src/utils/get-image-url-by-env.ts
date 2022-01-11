const getImageUrlByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  return __DEV__ ? `${link}` : `/page/dist${link}`;
};

export default getImageUrlByEnv;
