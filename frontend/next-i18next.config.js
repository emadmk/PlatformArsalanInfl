module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fa', 'fr', 'es', 'ar', 'de', 'pt', 'zh', 'ko', 'ja'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
