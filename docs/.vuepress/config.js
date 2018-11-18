module.exports = {
  title: 'yProx-CLI',
  description: '🔧 A tool for linting and building assets from yProx CMS.',
  serviceWorker: true,
  themeConfig: {
    repo: 'Yproximite/yProx-cli',
    docsDir: 'docs',
    editLinks: true,
    lastConfig: 'Last updated',
    serviceWorker: {
      updatePopup: true,
    },
    nav: [
      { text: 'npm', link: 'https://www.npmjs.com/package/@yproximite/yprox-cli' },
      { text: 'Travis', link: 'https://travis-ci.com/Yproximite/yProx-cli' },
    ],
    sidebar: [
      'getting-started',
      'configuration',
      'assets',
      'handlers',
      'cli-usage-and-commands',
      'env-vars-and-modes'
    ],
  },
};
