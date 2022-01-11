const getLinkByEnv = (link: string) => {
  if (!link) {
    return '';
  }

  if (__DEV__) {
    return link.includes('#') ? `${link}` : `/#${link}`;
  }
  return link.includes('#') ? `/page${link}` : `/page/#${link}`;
};

export default getLinkByEnv;
