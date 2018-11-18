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
    sidebar: [
      {
        collapsable: false,
        children: [
          'getting-started',
        ],
      },
    ],
  },
};
