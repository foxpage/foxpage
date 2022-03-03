module.exports = {
  dev: {
    env: 'dev',
    foxpageApi: 'http://ibu-qa-opensource-164331726.ap-southeast-1.elb.amazonaws.com/foxpage-server/',
    // foxpageApi: 'api.foxfamily.io/',
    ssrApi: 'http://ssr.api.foxfamily.io/',
    slug: '',
  },
  fat: {
    env: 'fat',
    foxpageApi: 'http://ibu-qa-opensource-164331726.ap-southeast-1.elb.amazonaws.com/foxpage-server/',
    ssrApi: 'http://ssr.api.foxfamily.io/',
    slug: 'foxpage-admin',
  },
  prd: {
    env: 'prd',
    foxpageApi: 'http://api.foxfamily.io/',
    ssrApi: 'http://ssr.api.foxfamily.io/',
    slug: 'foxpage-admin',
  },
};
