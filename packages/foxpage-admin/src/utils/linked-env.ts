const getLinkByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  // @ts-ignore
  if (__DEV__) {
    return link.includes('#') ? `${link}` : `/#${link}`;
  }
  // @ts-ignore
  return link.includes('#') ? `${APP_CONFIG.slug}${link}` : `${APP_CONFIG.slug}/#${link}`;
};

export default getLinkByEnv;
