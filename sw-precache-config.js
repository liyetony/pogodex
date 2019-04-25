module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'src/**/*',
    'images/types/*',
    'images/teams/*'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /^https:\/\/fonts.gstatic.com\//,
      handler: 'fastest'
    }
  ]
};
