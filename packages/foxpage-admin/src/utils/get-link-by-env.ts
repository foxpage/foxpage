const getLinkByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  if (__DEV__) {
    return link.includes('#') ? `${link}` : `/#${link}`;
  }
  return link.includes('#') ? `/${APP_CONFIG.slug}${link}` : `/${APP_CONFIG.slug}/#${link}`;
};

export default getLinkByEnv;
